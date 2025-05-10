# JavaScript Task Tracker – Developer Notes

## ✅ Fixed Bugs

- [x] Restored items were always going to `taskList` instead of `doneList`. (FIXED)
- [x] Check if `wasInDone` was ever defined. (FIXED)
- [x] Restore button not functioning. (FIXED)
- [x] Needed 3 clicks to open Recycle Bin. (FIXED)
- [x] Cursor flickering issue. (FIXED)
- [x] Duplicate entries in Recycle Bin when deleting existing items. (FIXED)
- [x] Recycled item not removed when restored and already exists. (FIXED)
- [x] Restored item via undo should also be removed from bin. (FIXED)
- [x] Heading `<h3>` of empty bin should remain visible. (FIXED)
- [x] Task items should be editable. (FIXED)
- [x] Undo button hides correctly when stack is empty. (FIXED)
- [x] `undoBtn.pop()` should remove the latest deleted task. (FIXED)

## 🧪 In Progress / To-Do

- [ ] Replace `taskItem` with `taskText` inside restore button function.
- [ ] Add dark mode toggle.
- [ ] Add `Ctrl + Z` and `Ctrl + Shift + Z` shortcuts.
- [ ] Make undo button share logic with restore stack condition.
- [ ] Undo button should disappear when the last bin task is deleted.
- [ ] On undo, remove corresponding `<li>` from `#bin-list`.
