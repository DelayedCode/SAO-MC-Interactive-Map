from pathlib import Path
import re

root = Path(__file__).resolve().parent
runtime_file = root / 'bestiary.js'
floor_files = [root / f'bestiary_floor{i}.js' for i in range(1, 4)]

text = runtime_file.read_text(encoding='utf-8-sig')
parse_start = text.index('function parseDropToken')
runtime = text[parse_start:]
prefix = (
    'var REGULAR_MOB_DATA = typeof REGULAR_MOB_DATA !== "undefined" ? REGULAR_MOB_DATA : "";\n'
    'var BOSS_MOB_DATA = typeof BOSS_MOB_DATA !== "undefined" ? BOSS_MOB_DATA : "";\n'
    'var DUNGEON_MOB_DATA = typeof DUNGEON_MOB_DATA !== "undefined" ? DUNGEON_MOB_DATA : "";\n'
    'var DUNGEON_BOSS_MOB_DATA = typeof DUNGEON_BOSS_MOB_DATA !== "undefined" ? DUNGEON_BOSS_MOB_DATA : "";\n\n'
    '// Floor-specific mob data is loaded from the floor data scripts.\n'
    '// Each floor file defines REGULAR_MOB_DATA, BOSS_MOB_DATA, DUNGEON_MOB_DATA, and DUNGEON_BOSS_MOB_DATA.\n\n'
)
runtime_file.write_text(prefix + runtime, encoding='utf-8')

# Extract known mob names from the aggressiveness map in the runtime source.
name_pattern = re.compile(r'\s+"([^"]+)":\s+"[^"]+",?')
known_names = set(name_pattern.findall(text))

# Also add mob names and search strings from map files, which contain full mob name lists.
map_root = root.parent / 'Map'
map_files = ['maps_floor1.js', 'maps_floor2.js', 'maps_floor3.js', 'maps.js']
map_name_pattern = re.compile(r'name:\s*"([^\"]+)"')
map_search_pattern = re.compile(r'search:\s*"([^\"]+)"')
for map_file in map_files:
    path = map_root / map_file
    if not path.exists():
        continue
    map_text = path.read_text(encoding='utf-8-sig')
    known_names.update(map_name_pattern.findall(map_text))
    known_names.update(map_search_pattern.findall(map_text))

known_names = sorted({name.strip() for name in known_names if name.strip()}, key=len, reverse=True)

block_pattern = re.compile(r'const\s+([A-Z_]+)\s*=\s*`([\s\S]*?)`;')
line_pattern = re.compile(r'(N/A|\d+)$')

for path in floor_files:
    content = path.read_text(encoding='utf-8-sig')
    blocks = block_pattern.findall(content)
    if not blocks:
        raise RuntimeError(f'No mob data blocks found in {path.name}')

    output_lines = []
    output_lines.append('// Floor-specific mob data for ' + path.name)
    output_lines.append('// Loaded before bestiary.js as the runtime script.')
    output_lines.append('')

    for block_name, raw in blocks:
        lines = [ln.rstrip() for ln in raw.strip().splitlines() if ln.strip()]
        fixed_lines = []
        for line in lines:
            match = line_pattern.search(line)
            if not match:
                raise ValueError(f'Unable to locate XP value in line: {line}')
            xp = match.group(1)
            rest = line[: match.start() ].strip()
            name = None
            for candidate in known_names:
                if rest.startswith(candidate):
                    name = candidate
                    break
            if name is None:
                # If no known name matches, use a fallback based on the first uppercase sequence and spaces.
                # This is less precise but helps avoid silent failure.
                raise ValueError(f'No known mob name found for line: {line}')
            drops = rest[len(name) :].strip() or 'N/A'
            fixed_lines.append(f'{name}\t{drops}\t{xp}')

        output_lines.append(f'const {block_name} = `')
        output_lines.extend(fixed_lines)
        output_lines.append('`;')
        output_lines.append('')

    path.write_text('\n'.join(output_lines).rstrip() + '\n', encoding='utf-8')
    print('Rewrote', path.name)

print('Rewrote bestiary.js and all floor data files.')
