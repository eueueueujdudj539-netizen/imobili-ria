import os

index_path = r"C:\Users\edval\.gemini\antigravity\scratch\casa-nobre-imoveis\index.html"
faq_path = r"C:\Users\edval\.gemini\antigravity\scratch\casa-nobre-imoveis\faq-section.html"
blog_path = r"C:\Users\edval\.gemini\antigravity\scratch\casa-nobre-imoveis\blog-section.html"

with open(index_path, 'r', encoding='utf-8') as f:
    index_content = f.read()

with open(faq_path, 'r', encoding='utf-8') as f:
    faq_content = f.read()
    
with open(blog_path, 'r', encoding='utf-8') as f:
    blog_content = f.read()

index_content = index_content.replace('<!-- FAQ_SECTION_PLACEHOLDER -->', faq_content)
index_content = index_content.replace('<!-- BLOG_SECTION_PLACEHOLDER -->', blog_content)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(index_content)

print("Injected FAQ and Blog content into index.html successfully.")
