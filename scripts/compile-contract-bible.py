"""Compile only source-package references from the licensed, pinned VPL archive."""
import hashlib
import json
import pathlib
import re
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
archive = ROOT / "content/bible/porbr2018_vpl.zip"
books = {
    "Gênesis": "GEN", "Êxodo": "EXO", "Deuteronômio": "DEU", "Salmo": "PSA", "Salmos": "PSA", "Provérbios": "PRO", "Eclesiastes": "ECC", "Cantares": "SNG",
    "Mateus": "MAT", "Marcos": "MRK", "Lucas": "LUK", "João": "JHN", "Atos": "ACT", "Romanos": "ROM", "1 Coríntios": "1CO", "2 Coríntios": "2CO", "Gálatas": "GAL", "Efésios": "EPH", "Filipenses": "PHP", "Colossenses": "COL",
    "1 Tessalonicenses": "1TH", "2 Tessalonicenses": "2TH", "1 Timóteo": "1TI", "2 Timóteo": "2TI", "Tito": "TIT", "Filemom": "PHM", "Hebreus": "HEB", "Tiago": "JAS", "1 Pedro": "1PE", "2 Pedro": "2PE", "1 João": "1JN", "2 João": "2JN", "3 João": "3JN", "Judas": "JUD", "Apocalipse": "REV",
}
books.update({"Cantares": "SOL", "Marcos": "MAR", "João": "JOH", "Filipenses": "PHI", "Tiago": "JAM", "1 João": "1JO", "2 João": "2JO", "3 João": "3JO"})
pattern = re.compile(r"(?<![\w])(" + "|".join(re.escape(b) for b in sorted(books, key=len, reverse=True)) + r")\s+(\d+)(?::(\d+)(?:[-–](\d+))?)?")
with zipfile.ZipFile(archive) as source:
    text = source.read("porbr2018_vpl.txt").decode("utf-8-sig")
    license_html = source.read("porbr2018_about.htm")
verses = {}
for line in text.splitlines():
    match = re.fullmatch(r"([A-Z0-9]{3}) (\d+):(\d+) (.*)", line)
    if match:
        book, chapter, verse, value = match.groups()
        verses[(book, int(chapter), int(verse))] = value.strip()
questions = json.loads((ROOT / "contrato_casamento_mestre/dados/perguntas.json").read_text(encoding="utf-8-sig"))
references = {}
for question in questions:
    sections = [s["text"] for s in question["source_sections"] if re.search(r"b.blic", s["label"], re.I)]
    for match in pattern.finditer("\n".join(sections)):
        book, chapter, first, last = match.groups()
        chapter = int(chapter)
        keys = [(books[book], chapter, n) for n in range(int(first), int(last or first) + 1)] if first else sorted(k for k in verses if k[0] == books[book] and k[1] == chapter)
        if not keys or any(key not in verses for key in keys):
            raise ValueError(f"Missing licensed verses for {match.group(0)}")
        reference = match.group(0)
        if reference not in references:
            references[reference] = {"reference": reference, "usage": "PRINCIPIO", "questionIds": [], "verses": [{"number": key[2], "text": verses[key]} for key in keys]}
        references[reference]["questionIds"].append(question["question_id"])
output = {
    "edition": "Bíblia Livre (BLIVRE), edição Textus Receptus, 2018",
    "attribution": "Textos bíblicos: Bíblia Livre (BLIVRE), copyright © 2018 Diego Santos, Mario Sérgio e Marco Teles. Licença Creative Commons Atribuição 4.0. Fonte: eBible.org/porbr2018. Arquivo obtido em 12/09/2026. Texto dos versículos preservado; títulos, notas e formatação não fazem parte desta transcrição VPL.",
    "sourceUrl": "https://ebible.org/porbr2018/copyright.htm",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "sourceArchiveSha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
    "references": list(references.values()),
}
(ROOT / "src/data/contract-bible.json").write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
(ROOT / "content/bible/LICENSE-source.html").write_bytes(license_html)
print(f"Bible source verified: {len(references)} references; {sum(len(r['verses']) for r in references.values())} verse occurrences.")
