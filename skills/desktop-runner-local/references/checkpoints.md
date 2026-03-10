# Checkpoint strategy

## Principle
Never do a long opaque automation run when a task can be broken into visible checkpoints.

## Good checkpoint sequence
- detect state
- act once
- verify
- continue

## Examples
- open page -> verify title -> fill form -> verify banner
- open app -> verify window -> send shortcut -> verify dialog
- run installer -> verify version -> test command
