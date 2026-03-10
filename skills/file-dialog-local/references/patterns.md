# File dialog patterns

## Upload flow
- trigger upload
- wait for dialog
- set absolute file path
- confirm
- verify file attached

## Save As flow
- trigger save-as
- wait for dialog
- set full target path
- confirm overwrite only with explicit approval if relevant
- verify output file exists

## Open flow
- trigger open/import
- wait for dialog
- set path
- confirm
- verify target content loaded
