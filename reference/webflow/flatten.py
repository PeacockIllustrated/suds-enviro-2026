import json,sys

TEXTY={"String"}

def walk(n,d,out):
    t=n.get("type")
    if t=="String":
        s=(n.get("textContent") or "")
        if s.strip(): out.append("  "*d+"» "+s.strip()[:400])
        return
    st=n.get("styleNames") or []
    se=n.get("settings") or {}
    bits=[t]
    if st: bits.append("."+".".join(st))
    tag=se.get("tag")
    if tag and tag!="div": bits.append(f"<{tag}>")
    if se.get("assetId"): bits.append(f"asset={se['assetId']}")
    for k in ("link","linkSettings","image","video","embed","customCode","html","spline","text","url","src"):
        v=se.get(k)
        if v: bits.append(f"{k}={json.dumps(v)[:500]}")
    inst=n.get("instanceDetails")
    if inst: bits.append(f"COMPONENT={inst.get('name')} id={inst.get('id')}")
    out.append("  "*d+" ".join(bits))
    for c in n.get("children",[]) or []:
        walk(c,d+1,out)

d=json.load(open(sys.argv[1]))
root=d["result"][0]["data"]
out=[]
walk(root,0,out)
print("\n".join(out))
