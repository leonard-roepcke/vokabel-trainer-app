let activeDragListId = null;
let touchDragState = null;

function clearDropHighlights(root) {
  root.querySelectorAll(".drop-target-active").forEach((el) => {
    el.classList.remove("drop-target-active");
  });
}

function findDropZoneAt(root, x, y) {
  clearDropHighlights(root);
  const element = document.elementFromPoint(x, y);
  if (!element) return null;

  const zone = element.closest(".drop-zone");
  if (!zone || !root.contains(zone)) return null;

  zone.classList.add("drop-target-active");
  return zone;
}

function getFolderIdFromZone(zone) {
  const value = zone.dataset.folderId;
  return value ? value : null;
}

export function setupListDragAndDrop({ root, onMoveList }) {
  const moveList = (listId, folderId) => {
    if (!listId) return;
    onMoveList(listId, folderId);
  };

  root.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", (event) => {
      if (!activeDragListId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      zone.classList.add("drop-target-active");
    });

    zone.addEventListener("dragleave", (event) => {
      if (!zone.contains(event.relatedTarget)) {
        zone.classList.remove("drop-target-active");
      }
    });

    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      const listId = event.dataTransfer.getData("text/plain") || activeDragListId;
      moveList(listId, getFolderIdFromZone(zone));
      clearDropHighlights(root);
      activeDragListId = null;
    });
  });

  root.querySelectorAll(".list-drag-handle").forEach((handle) => {
    const card = handle.closest(".list-card");
    const listId = card?.dataset.listId;
    if (!listId) return;

    handle.addEventListener("dragstart", (event) => {
      activeDragListId = listId;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", listId);
      card.classList.add("is-dragging");
    });

    handle.addEventListener("dragend", () => {
      activeDragListId = null;
      card.classList.remove("is-dragging");
      clearDropHighlights(root);
    });

    handle.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) return;

        const touch = event.touches[0];
        touchDragState = {
          listId,
          card,
          startX: touch.clientX,
          startY: touch.clientY,
          active: false,
          timer: window.setTimeout(() => {
            if (!touchDragState || touchDragState.listId !== listId) return;
            touchDragState.active = true;
            activeDragListId = listId;
            card.classList.add("is-dragging");
          }, 220),
        };
      },
      { passive: true },
    );

    handle.addEventListener(
      "touchmove",
      (event) => {
        if (!touchDragState || touchDragState.listId !== listId) return;

        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - touchDragState.startX);
        const deltaY = Math.abs(touch.clientY - touchDragState.startY);

        if (!touchDragState.active) {
          if (deltaX > 12 || deltaY > 12) {
            window.clearTimeout(touchDragState.timer);
            touchDragState = null;
          }
          return;
        }

        event.preventDefault();
        findDropZoneAt(root, touch.clientX, touch.clientY);
      },
      { passive: false },
    );

    const endTouchDrag = (event) => {
      if (!touchDragState || touchDragState.listId !== listId) return;

      window.clearTimeout(touchDragState.timer);

      if (touchDragState.active) {
        const touch = event.changedTouches[0];
        const zone = findDropZoneAt(root, touch.clientX, touch.clientY);
        if (zone) {
          moveList(listId, getFolderIdFromZone(zone));
        }
      }

      card.classList.remove("is-dragging");
      clearDropHighlights(root);
      activeDragListId = null;
      touchDragState = null;
    };

    handle.addEventListener("touchend", endTouchDrag);
    handle.addEventListener("touchcancel", endTouchDrag);
  });
}
