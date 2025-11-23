import re

file_path = 'src/components/ReportScam.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace scamTypes
old_scam_types = r"const scamTypes = \[\s+t\('reportScam\.scamTypes\.phishingEmail'\),[\s\S]+?t\('reportScam\.scamTypes\.other'\),\s+\];"
new_scam_types = """const scamTypes = [
    { key: 'phishingEmail', label: 'reportScam.scamTypes.phishingEmail' },
    { key: 'fakeWebsite', label: 'reportScam.scamTypes.fakeWebsite' },
    { key: 'phoneScam', label: 'reportScam.scamTypes.phoneScam' },
    { key: 'smsScam', label: 'reportScam.scamTypes.smsScam' },
    { key: 'socialMediaScam', label: 'reportScam.scamTypes.socialMediaScam' },
    { key: 'investmentFraud', label: 'reportScam.scamTypes.investmentFraud' },
    { key: 'romanceScam', label: 'reportScam.scamTypes.romanceScam' },
    { key: 'techSupportScam', label: 'reportScam.scamTypes.techSupportScam' },
    { key: 'upiFrauds', label: 'reportScam.scamTypes.upiFrauds' },
    { key: 'onlineFinancialFraud', label: 'reportScam.scamTypes.onlineFinancialFraud' },
    { key: 'other', label: 'reportScam.scamTypes.other' },
  ];"""

content = re.sub(old_scam_types, new_scam_types, content)

# 2. Replace genders
old_genders = r"const genders = \[t\('reportScam\.gender\.male', 'Male'\), t\('reportScam\.gender\.female', 'Female'\), t\('reportScam\.gender\.other', 'Other'\)\];"
new_genders = """const genders = [
    { key: 'male', label: 'reportScam.gender.male' },
    { key: 'female', label: 'reportScam.gender.female' },
    { key: 'other', label: 'reportScam.gender.other' },
  ];"""

content = re.sub(old_genders, new_genders, content)

# 3. Replace scamTypes map
old_scam_map = r"\{scamTypes\.map\(type => \(<option key=\{type\} value=\{type\}>\{type\}</option>\)\)\}"
new_scam_map = "{scamTypes.map(type => (<option key={type.key} value={type.key}>{t(type.label)}</option>))}"
content = re.sub(old_scam_map, new_scam_map, content)

# 4. Replace genders map
old_gender_map = r"\{genders\.map\(gender => \(<option key=\{gender\} value=\{gender\}>\{gender\}</option>\)\)\}"
new_gender_map = "{genders.map(gender => (<option key={gender.key} value={gender.key}>{t(gender.label)}</option>))}"
content = re.sub(old_gender_map, new_gender_map, content)

# 5. Fix pincodeSuccess
# Find the block
pincode_block_pattern = r"(\s+)\{/\* \{pincodeSuccess && \(\s+<div className=\"mt-2 p-2 bg-green-100 border border-green-300 rounded-lg\">[\s\S]+?\}\) \*/\}"
match = re.search(pincode_block_pattern, content)

if match:
    full_block = match.group(0)
    indent = match.group(1)
    
    # Remove the comment markers
    uncommented = full_block.replace('{/* ', '').replace(' */}', '')
    
    # Remove the block from its current position
    content = content.replace(full_block, "")
    
    # Find the closing div of the flex container (which is just before the block was)
    # The block was inside <div className="flex gap-2"> ... </div>
    # We want to place it AFTER that div.
    
    # We look for the place where we removed it. 
    # The context is:
    # </div>
    # {removed_block}
    # </div>
    
    # Wait, in the original file:
    # <div className="flex gap-2">
    #   <div ...> ... </div>
    #   {/* block */}
    # </div>
    
    # So if we remove it, we are left with:
    # <div className="flex gap-2">
    #   <div ...> ... </div>
    # </div>
    
    # We want to insert it AFTER the closing </div> of "flex gap-2".
    
    # Let's find the "flex gap-2" container and append after it.
    flex_container_start = r'<div className="flex gap-2">'
    flex_start_match = re.search(flex_container_start, content)
    
    if flex_start_match:
        # This is risky with regex to find matching closing div.
        # Instead, let's look at the specific structure we know exists.
        
        # We know the structure is:
        # <div className="flex gap-2">
        #   <div className="flex-1 relative">
        #     ...
        #   </div>
        # </div>
        
        target_str = """                          {isPincodeLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </div>"""
        
        if target_str in content:
            # Insert after this
            replacement = target_str + "\n" + uncommented
            content = content.replace(target_str, replacement)
            print("Successfully moved pincodeSuccess block")
        else:
            print("Could not find target string for pincodeSuccess")
    else:
        print("Could not find flex container")

else:
    print("Could not find pincodeSuccess block")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating ReportScam.tsx")
