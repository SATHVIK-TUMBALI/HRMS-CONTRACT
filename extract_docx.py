import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = 'HRMS.docx'
out_path = 'HRMS.md'

if not os.path.exists(docx_path):
    print("HRMS.docx not found!")
    exit(1)

namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

with zipfile.ZipFile(docx_path) as docx:
    xml_content = docx.read('word/document.xml')
    root = ET.fromstring(xml_content)
    
    lines = []
    body = root.find('.//w:body', namespaces)
    if body is not None:
        for child in body:
            if child.tag.endswith('p'):
                p_text = ""
                for t in child.findall('.//w:t', namespaces):
                    if t.text:
                        p_text += t.text
                lines.append(p_text)
            elif child.tag.endswith('tbl'):
                # Let's extract table rows
                lines.append("\n")
                for r_idx, row in enumerate(child.findall('.//w:tr', namespaces)):
                    row_cells = []
                    for cell in row.findall('.//w:tc', namespaces):
                        cell_text = ""
                        for t in cell.findall('.//w:t', namespaces):
                            if t.text:
                                cell_text += t.text
                        row_cells.append(cell_text.strip())
                    if r_idx == 0:
                        lines.append("| " + " | ".join(row_cells) + " |")
                        lines.append("| " + " | ".join(["---"] * len(row_cells)) + " |")
                    else:
                        lines.append("| " + " | ".join(row_cells) + " |")
                lines.append("\n")

with open(out_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(lines))
print("Done extracting to HRMS.md")
