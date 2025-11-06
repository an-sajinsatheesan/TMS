#!/bin/bash

# Comprehensive PrimeReact to shadcn/ui migration script

echo "Starting migration from PrimeReact to shadcn/ui..."

# Remove all PrimeReact imports and CSS
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i \
  -e "/import.*'primereact/d" \
  -e "/import.*'primeicons/d" \
  -e "/export.*from 'primereact/d" \
  {} \;

echo "✓ Removed PrimeReact imports"

# Function to replace components in files
replace_in_files() {
  find src -type f \( -name "*.jsx" -o -name "*.js" \) ! -path "*/ui/*" -exec sed -i "$1" {} \;
}

# Replace classNames utility
replace_in_files "s/classNames/cn/g"

echo "✓ Replaced classNames with cn"

echo "Migration script completed. Manual review required for:"
echo "  - Custom component conversions"
echo "  - Complex PrimeReact features"
echo "  - Stepper components"
echo "  - MultiSelect components"

