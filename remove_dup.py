import re

file_path = 'src/app/[locale]/dashboard/reports/print/PrintSlides.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the LAST instance of export const ConclusionSlide
first_idx = content.find('export const ConclusionSlide')
last_idx = content.rfind('export const ConclusionSlide')

if first_idx != last_idx and first_idx != -1:
    # Delete everything from the last instance down to the end of the file (or end of slide)
    # The last instance was appended by my script, so it's at the very end of the file
    content = content[:content.rfind('// Conclusion Slide')]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Removed duplicate ConclusionSlide!")
else:
    print("No duplicates found.")
