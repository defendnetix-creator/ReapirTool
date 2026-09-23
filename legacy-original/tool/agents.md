# Akash Toolkit Rebranding and Stability Requirements

## Project Goal

Modify the existing toolkit while preserving all existing functionality. The final output must behave exactly like the original toolkit unless explicitly specified below.

## Critical Rule 1 - Preserve Functionality

* Do not remove any existing features.
* Do not change workflow logic.
* Do not change execution order.
* Do not remove PowerShell modules.
* Do not remove reporting functionality.
* Do not remove repair functionality.
* Do not remove inventory collection functionality.
* Do not remove launcher functionality.
* Do not modify business logic unless required to complete the requested rebranding.

The toolkit must function exactly as before after all modifications.

## Critical Rule 2 - Rebranding

Perform a complete search across the entire repository.

Replace all occurrences of:

Akash Hodlur

with:

Akash Hodlur

Apply replacement in:

* Source code
* HTML files
* JavaScript files
* CSS files
* PowerShell scripts
* Batch files
* JSON files
* Configuration files
* About pages
* Dashboard pages
* Comments
* Resource files
* Build metadata
* Documentation
* Splash screens
* Version information
* Tooltips
* Report headers
* Exported reports
* Generated PDFs
* Generated HTML reports

Do not modify variable names unless they are clearly branding-related.

Generate a report showing:

* File name
* Original value
* New value

## Critical Rule 3 - Code Quality and Security Review

Perform a full code review.

Identify:

* Broken code
* Unused code
* Runtime errors
* Build errors
* Null reference risks
* Missing dependencies
* Invalid paths
* Incorrect permissions
* PowerShell execution issues

Fix only issues that improve reliability without changing functionality.

## Critical Rule 4 - Security and Trust Improvements

Review all components that may trigger security warnings.

Inspect:

* PowerShell execution
* Embedded resources
* File extraction logic
* Process launching logic
* Permission changes
* Temporary file creation

Provide recommendations that improve transparency and maintainability.

Do not add any functionality intended to bypass antivirus software, Windows Defender, SmartScreen, endpoint protection, code-signing requirements, or operating-system security features.

If a security warning is caused by legitimate code behavior, document the reason and propose safer alternatives.

## Critical Rule 5 - Build Validation

After modifications:

* Verify project compiles successfully.
* Verify PowerShell scripts load successfully.
* Verify launcher starts successfully.
* Verify dashboard loads successfully.
* Verify all major modules are callable.
* Verify no missing references exist.

Create a build validation report.

## Critical Rule 6 - Final Deliverables

Produce:

1. Modified source code.
2. Rebranding report.
3. Security review report.
4. Build validation report.
5. Release build instructions.

The final codebase must remain fully functional and maintain the behavior of the original toolkit.

## Critical Rule 7 - Full Security Audit

Perform a complete review of the entire codebase before making changes.

Inspect all source files, scripts, resources, executables, configuration files, and embedded content.

Look for:

* Credential theft functionality
* Password extraction
* Browser cookie extraction
* Token harvesting
* Keylogging functionality
* Screenshot capture functionality
* Clipboard monitoring
* Unauthorized remote access functionality
* Reverse shell behavior
* Backdoor functionality
* Data exfiltration
* Uploading user files to external services
* Sending system information to unknown endpoints
* Hidden scheduled tasks
* Unauthorized persistence mechanisms
* Registry autorun entries
* Hidden background services
* Obfuscated code
* Encoded PowerShell payloads
* Dynamic code execution
* Download-and-execute behavior
* Suspicious network communications
* Hardcoded external endpoints
* Embedded binaries with undocumented behavior

For every finding:

* Document the file name.
* Document the exact code location.
* Explain the purpose of the code.
* Classify risk as Low, Medium, High, or Critical.

If malicious, harmful, undocumented, or suspicious behavior is identified:

* Remove it only after confirming it is not required for legitimate toolkit functionality.
* Replace it with a safe implementation when necessary.
* Preserve all legitimate toolkit features.

Do not remove components that are required for:

* Inventory collection
* Reporting
* Diagnostics
* Repair operations
* Dashboard functionality
* Launcher functionality

Generate a Security Audit Report containing:

* Findings
* Risk levels
* Actions taken
* Files modified
* Validation results

After remediation:

* Re-scan the repository.
* Verify all original features still function.
* Verify the application builds successfully.
* Verify no known malicious behavior remains.
## Critical Rule 8 - Windows Defender Compatibility Review

The objective is to maximize trustworthiness and minimize false-positive detections from Windows Defender while preserving all legitimate functionality.

Perform a complete review of:

* PowerShell execution methods
* Process launching behavior
* Embedded executables
* Resource extraction
* Temporary file creation
* Permission modifications
* Network communication
* Scheduled tasks
* Self-healing components
* Obfuscated or encoded code

Identify code patterns that commonly trigger Windows Defender warnings.

For each finding:

* Explain why it may trigger a security warning.
* Recommend a safer implementation when possible.
* Preserve all legitimate functionality.

Do not implement:

* Antivirus bypasses
* Defender bypasses
* Security-evasion techniques
* Obfuscation intended to avoid detection

Instead:

* Improve code transparency.
* Remove unnecessary suspicious behavior.
* Eliminate unused executables and scripts.
* Remove undocumented network communication.
* Remove confirmed malicious functionality if found.
* Reduce false-positive triggers where possible.

Generate a Windows Defender Compatibility Report showing:

* Potential detection causes
* Risk level
* Recommended remediation
* Changes applied
* Validation results

The final application should remain fully functional while following Windows security best practices.
