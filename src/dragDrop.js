let activeDragListId = null;
let touchDragState = null;

function clearDropHighlights(root) {
  root
    .querySelectorAll(".drop-target-active, .drop-insert-before, .drop-insert-after")
    .forEach((el) => {
      el.classList.remove("drop-target-active", "drop-insert-before", "drop-insert-after");
    });
}

function getFolderIdFromZone(zone) {
  if (!zone) return null;
  const value = zone.dataset.folderId;
  return value ? value : null;
}

function getInsertPosition(card, y) {
  const rect = card.getBoundingClientRect();
  const insertAfter = y > rect.top + rect.height / 2;

  if (!insertAfter) {
    return { beforeListId: card.dataset.listId, afterListId: null };
  }

  let next = card.nextElementSibling;
  while (next && !next.classList.contains("list-card")) {
    next = next.nextElementSibling;
  }

  if (next) {
    return { beforeListId: next.dataset.listId, afterListId: null };
  }

  return { beforeListId: null, afterListId: card.dataset.listId };
}

function highlightTarget(root, target) {
  clearDropHighlights(root);
  if (!target) return;

  if (target.type === "list") {
    if (target.insertAfter) {
      target.card.classList.add("drop-insert-after");
    } else {
      target.card.classList.add("drop-insert-before");
    }
    return;
  }

  target.zone.classList.add("drop-target-active");
}

function findDropTargetAt(root, x, y) {
  const element = document.elementFromPoint(x, y);
  if (!element) return null;

  const card = element.closest(".list-card");
  if (card && root.contains(card) && !card.classList.contains("is-dragging")) {
    const zone = card.closest(".drop-zone");
    if (!zone) return null;

    const { beforeListId, afterListId } = getInsertPosition(card, y);
    const rect = card.getBoundingClientRect();
    const insertAfter = y > rect.top + rect.height / 2;

    return {
      type: "list",
      card,
      zone,
      folderId: getFolderIdFromZone(zone),
      beforeListId,
      afterListId,
      insertAfter,
    };
  }

  const zones = [...root.querySelectorAll(".drop-zone")];
  const match = zones
    .map((zone) => {
      const rect = zone.getBoundingClientRect();
      const inside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      return inside ? { zone, area: rect.width * rect.height } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.area - b.area)[0];

  if (!match) return null;

  return {
    type: "zone",
    zone: match.zone,
    folderId: getFolderIdFromZone(match.zone),
    beforeListId: null,
    afterListId: null,
  };
}

export function setupListDragAndDrop({ root, onMoveList }) {
  const applyDrop = (listId, target) => {
    if (!listId || !target) return;
    onMoveList(listId, target.folderId, {
      beforeListId: target.beforeListId,
      afterListId: target.afterListId,
    });
  };

  root.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", (event) => {
      if (!activeDragListId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      const target = findDropTargetAt(root, event.clientX, event.clientY);
      if (target?.type === "zone" && target.zone === zone) {
        highlightTarget(root, target);
      } else if (target?.type === "list") {
        highlightTarget(root, target);
      }
    });

    zone.addEventListener("dragleave", (event) => {
      const related = event.relatedTarget;
      if (!related || !zone.contains(related)) {
        zone.classList.remove("drop-target-active");
      }
    });

    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      const listId = event.dataTransfer.getData("text/plain") || activeDragListId;
      const target = findDropTargetAt(root, event.clientX, event.clientY);
      applyDrop(listId, target);
      clearDropHighlights(root);
      activeDragListId = null;
    });
  });

  root.querySelectorAll(".list-card").forEach((card) => {
    card.addEventListener("dragover", (event) => {
      if (!activeDragListId || card.classList.contains("is-dragging")) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      highlightTarget(root, findDropTargetAt(root, event.clientX, event.clientY));
    });

    card.addEventListener("drop", (event) => {
      if (!activeDragListId) return;
      event.preventDefault();
      event.stopPropagation();
      const listId = event.dataTransfer.getData("text/plain") || activeDragListId;
      applyDrop(listId, findDropTargetAt(root, event.clientX, event.clientY));
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
        highlightTarget(root, findDropTargetAt(root, touch.clientX, touch.clientY));
      },
      { passive: false },
    );

    const endTouchDrag = (event) => {
      if (!touchDragState || touchDragState.listId !== listId) return;

      window.clearTimeout(touchDragState.timer);

      if (touchDragState.active) {
        const touch = event.changedTouches[0];
        applyDrop(listId, findDropTargetAt(root, touch.clientX, touch.clientY));
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
