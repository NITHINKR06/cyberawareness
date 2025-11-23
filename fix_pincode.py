file_path = 'src/components/ReportScam.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target_block = """                        </div>
                        {/* {pincodeSuccess && (
                          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg">
                            <p className="text-sm text-green-800 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              {pincodeSuccess}
                            </p>
                          </div>
                        )} */}
                      </div>"""

replacement_block = """                        </div>
                      </div>
                      {pincodeSuccess && (
                        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded-lg">
                          <p className="text-sm text-green-800 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {pincodeSuccess}
                          </p>
                        </div>
                      )}"""

if target_block in content:
    content = content.replace(target_block, replacement_block)
    print("✓ Replaced pincodeSuccess block")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
else:
    print("✗ Could not find pincodeSuccess block")
    # Debug: print surrounding content
    start_marker = 'placeholder={t(\'reportScam.pincodePlaceholder\')}'
    idx = content.find(start_marker)
    if idx != -1:
        print("Found start marker, context:")
        print(content[idx:idx+1000])
