from bs4 import BeautifulSoup
import re, sys
p = sys.argv[1] if len(sys.argv)>1 else "index.html"
soup = BeautifulSoup(open(p, encoding="utf-8").read(), "html.parser")
for t in soup(["script","style"]): t.decompose()
visible = soup.get_text(separator=" ")
# Tillåt emoji + whitespace + variation selectors, flagga bokstäver/siffror
m = re.search(r'[A-Za-z0-9]', visible)
if m:
    print("FAIL: synlig text hittad")
    print(re.findall(r'.{0,15}[A-Za-z0-9].{0,15}', visible)[:5])
    sys.exit(1)
if soup.find("text"):
    print("FAIL: SVG <text> hittad"); sys.exit(1)
print("PASS: ingen synlig text i", p)
