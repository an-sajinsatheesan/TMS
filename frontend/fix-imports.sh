#!/bin/bash

# Remove all PrimeReact and PrimeIcons imports from all files
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i \
  -e "/import.*'primereact/d" \
  -e "/import.*'primeicons/d" \
  -e "/export.*from 'primereact/d" \
  {} \;

echo "✓ Removed all PrimeReact imports"
