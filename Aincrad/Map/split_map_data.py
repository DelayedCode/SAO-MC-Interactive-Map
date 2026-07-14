from pathlib import Path
import re

root = Path(__file__).parent
map_data_path = root / 'mapData.js'
if not map_data_path.exists():
    raise SystemExit('mapData.js not found')
text = map_data_path.read_text(encoding='utf-8')

# Balanced block parser that handles nested braces/brackets and strings.
def find_balanced(start_index, open_char, close_char, text):
    depth = 0
    in_string = False
    escape = False
    for i in range(start_index, len(text)):
        ch = text[i]
        if escape:
            escape = False
            continue
        if ch == '\\':
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch == open_char:
            depth += 1
        elif ch == close_char:
            depth -= 1
            if depth == 0:
                return i
    return -1

# Extract blocks by keyword.
def extract_block(keyword, open_char, close_char):
    idx = text.find(keyword)
    if idx < 0:
        raise SystemExit(f'Keyword not found: {keyword}')
    start = text.find(open_char, idx + len(keyword))
    if start < 0:
        raise SystemExit(f'Opening char {open_char} not found after {keyword}')
    end = find_balanced(start, open_char, close_char, text)
    if end < 0:
        raise SystemExit(f'Closing char {close_char} not found for {keyword}')
    return idx, start, end + 1, text[idx:end + 1]

# Find DATA object block.
data_keyword = 'const DATA = '
idx_data = text.find(data_keyword)
if idx_data < 0:
    raise SystemExit('DATA keyword not found')
start_data = text.find('{', idx_data + len(data_keyword))
if start_data < 0:
    raise SystemExit('DATA opening brace not found')
end_data = find_balanced(start_data, '{', '}', text)
if end_data < 0:
    raise SystemExit('DATA closing brace not found')
data_block = text[idx_data:end_data + 1]

# Find RAW_MAP2_WAYPOINT_LINES block.
raw_keyword = 'const RAW_MAP2_WAYPOINT_LINES = '
raw_block = None
idx_raw = text.find(raw_keyword)
if idx_raw >= 0:
    start_raw = text.find('[', idx_raw + len(raw_keyword))
    if start_raw < 0:
        raise SystemExit('RAW_MAP2 opening bracket not found')
    end_raw = find_balanced(start_raw, '[', ']', text)
    if end_raw < 0:
        raise SystemExit('RAW_MAP2 closing bracket not found')
    raw_block = text[idx_raw:end_raw + 1]

# Find Object.assign raw line.
assign_line = 'Object.assign(DATA, createMap2WaypointEntries(RAW_MAP2_WAYPOINT_LINES));'
idx_assign = text.find(assign_line)

# Find MOB_AREAS block.
mob_keyword = 'const MOB_AREAS = '
idx_mob = text.find(mob_keyword)
if idx_mob < 0:
    raise SystemExit('MOB_AREAS keyword not found')
start_mob = text.find('[', idx_mob + len(mob_keyword))
if start_mob < 0:
    raise SystemExit('MOB_AREAS opening bracket not found')
end_mob = find_balanced(start_mob, '[', ']', text)
if end_mob < 0:
    raise SystemExit('MOB_AREAS closing bracket not found')
mob_block = text[idx_mob:end_mob + 1]

# Parse top-level DATA entries.
entries = []
cur = None
brace = 0
for line in data_block.splitlines()[1:-1]:
    if cur is None:
        m = re.match(r'\s*"([^"]+)"\s*:\s*\{', line)
        if m:
            cur_key = m.group(1)
            cur_lines = [line]
            brace = 1
            cur = True
        else:
            continue
    else:
        cur_lines.append(line)
        for ch in line:
            if ch == '{':
                brace += 1
            elif ch == '}':
                brace -= 1
        if brace == 0:
            entries.append((cur_key, '\n'.join(cur_lines)))
            cur = None

if not entries:
    raise SystemExit('No DATA entries parsed')

# Parse MOB_AREAS entries.
mob_entries = []
cur_lines = None
brace = 0
for line in mob_block.splitlines()[1:-1]:
    if cur_lines is None:
        if re.match(r'\s*\{', line):
            cur_lines = [line]
            brace = 1
    else:
        cur_lines.append(line)
        for ch in line:
            if ch == '{':
                brace += 1
            elif ch == '}':
                brace -= 1
        if brace == 0:
            mob_entries.append('\n'.join(cur_lines))
            cur_lines = None

if not mob_entries:
    raise SystemExit('No MOB_AREAS entries parsed')

# Group by floor.
floor_data = {'floor1': [], 'floor2': [], 'floor3': []}
for key, block in entries:
    m = re.search(r'floor\s*:\s*"(floor[123])"', block)
    if not m:
        raise SystemExit(f'Floor not found in DATA entry {key}')
    floor_data[m.group(1)].append((key, block))

floor_mob = {'floor1': [], 'floor2': [], 'floor3': []}
for block in mob_entries:
    m = re.search(r'floor\s*:\s*"(floor[123])"', block)
    if not m:
        raise SystemExit('Floor not found in MOB_AREAS entry')
    floor_mob[m.group(1)].append(block)

for floor in ('floor1', 'floor2', 'floor3'):
    if not floor_data[floor] and not floor_mob[floor]:
        print(f'No data found for {floor}; writing empty file')

# Backup original files.
for path in [map_data_path, root / 'maps_floor1.js', root / 'maps_floor2.js', root / 'maps_floor3.js']:
    if path.exists():
        path.write_text(path.read_text(encoding='utf-8'), encoding='utf-8')
        backup = path.with_suffix(path.suffix + '.bak')
        backup.write_text(path.read_text(encoding='utf-8'), encoding='utf-8')

# Write floor-specific JS files.
for floor in ('floor1', 'floor2', 'floor3'):
    floor_file = root / f'maps_{floor}.js'
    lines = [f'// Floor-specific map data for {floor}', '', 'Object.assign(DATA, {']
    for key, block in floor_data[floor]:
        normalized = re.sub(r',\s*$', '', block.rstrip())
        lines.append(normalized + ',')
    lines.append('});')
    lines.append('')
    if floor == 'floor2' and raw_block is not None and idx_raw >= 0 and idx_assign >= 0:
        lines.append(raw_block)
        lines.append('')
        lines.append(assign_line)
        lines.append('')
    # Mob areas push
    lines.append('MOB_AREAS.push(')
    for block in floor_mob[floor]:
        normalized = re.sub(r',\s*$', '', block.rstrip())
        lines.append(normalized + ',')
    lines.append(');')
    lines.append('')
    floor_file.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Wrote {floor_file.name} with {len(floor_data[floor])} DATA entries and {len(floor_mob[floor])} mob entries')

# Build new mapData.js runtime-only file.
new_parts = []
new_parts.append(text[:idx_data])
new_parts.append('const DATA = {};\n\n')
new_parts.append('const MOB_AREAS = [];\n\n')
# Keep remaining text after the MOB_AREAS block and optional trailing semicolon.
tail_start = end_mob + 1
if tail_start < len(text) and text[tail_start] == ';':
    tail_start += 1
new_parts.append(text[tail_start:])
new_text = ''.join(new_parts)
map_data_path.write_text(new_text, encoding='utf-8')
print('Updated mapData.js runtime-only')
