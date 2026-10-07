import nbtlib

for f in ["OurNotWorkingWaypointData.dat", "WaypointDataWorking.dat"]:
    n = nbtlib.load(f)
    root = n.root if hasattr(n, "root") else n
    print("===", f)
    if "waypoints" in root:
        wps = root["waypoints"]
        print("waypoint count:", len(wps))
        for guid, wp in wps.items():
            pos = wp.get("pos", {})
            print(
                f"{wp.get('name','?')!r}: x={pos.get('x')} y={pos.get('y')} "
                f"z={pos.get('z')} dim={pos.get('dimension')} "
                f"group={wp.get('groupId')} origin={wp.get('origin')}"
            )
    else:
        out = []
        def walk(tag):
            if isinstance(tag, nbtlib.Compound):
                if "name" in tag and "x" in tag and "z" in tag:
                    out.append((str(tag["name"]), float(tag["x"]), float(tag["z"])))
                for k in tag:
                    walk(tag[k])
            elif isinstance(tag, nbtlib.List):
                for item in tag:
                    walk(item)
        walk(root)
        seen = set()
        for name, x, z in out:
            key = (name, round(x, 2), round(z, 2))
            if key in seen:
                continue
            seen.add(key)
            print(f"{name!r}: x={x} z={z}")
        print(len(seen), "waypoints")
