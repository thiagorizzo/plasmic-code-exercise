import React, { useEffect, useState } from "react";

export const DrawBoxLayerMode = {
  SELECTED: "box-selected",
  MOVING: "box-moving",
  DRAWING: "box-drawing",
  STATIC: "box-static",
  RESIZING: "box-resizing",
};

export const DrawBoxResizeSide = {
  TOP_LEFT: 1,
  TOP_RIGHT: 2,
  BOTTOM_LEFT: 3,
  BOTTOM_RIGHT: 4,
};

function DrawBoxLayer({ boxLayer, mode, onBoxSelected, onBoxResize }) {
  const [box, setBox] = useState(boxLayer);
  const [boxMode, setBoxMode] = useState(mode);

  useEffect(() => {
    setBox(boxLayer);
  }, [boxLayer]);

  useEffect(() => {
    setBoxMode(mode);
  }, [mode]);

  function handleMouseDown(e) {
    e.stopPropagation();
    if (onBoxSelected) {
      onBoxSelected(e, box);
    }
  }

  function handleMouseDownResize(e, side) {
    e.stopPropagation();
    if (onBoxResize) {
      onBoxResize(e, side);
    }
  }

  return (
    <>
      {(boxMode === DrawBoxLayerMode.SELECTED ||
        boxMode === DrawBoxLayerMode.RESIZING) && (
        <>
          <div
            className="box-resize box-resize-top-right"
            onMouseDown={(e) =>
              handleMouseDownResize(e, DrawBoxResizeSide.TOP_RIGHT)
            }
            style={{
              top: box.initialY - 4,
              left: box.initialX + box.width - 4,
            }}
            id={box.uuid}
          ></div>
          <div
            className="box-resize box-resize-top-left"
            onMouseDown={(e) =>
              handleMouseDownResize(e, DrawBoxResizeSide.TOP_LEFT)
            }
            style={{
              top: box.initialY - 4,
              left: box.initialX - 4,
            }}
            id={box.uuid}
          ></div>
          <div
            className="box-resize box-resize-bottom-right"
            onMouseDown={(e) =>
              handleMouseDownResize(e, DrawBoxResizeSide.BOTTOM_RIGHT)
            }
            style={{
              top: box.initialY + box.height - 4,
              left: box.initialX + box.width - 4,
            }}
            id={box.uuid}
          ></div>
          <div
            className="box-resize box-resize-bottom-left"
            onMouseDown={(e) =>
              handleMouseDownResize(e, DrawBoxResizeSide.BOTTOM_LEFT)
            }
            style={{
              top: box.initialY + box.height - 4,
              left: box.initialX - 4,
            }}
            id={box.uuid}
          ></div>
          <div
            className="box-header-info"
            style={{
              top: box.initialY - 30,
              left: box.initialX + 5,
            }}
          >
            <div className="box-header-symbol"></div>
            <div className="box-header-description">box</div>
          </div>
        </>
      )}
      <div
        style={{
          width: box.width,
          height: box.height,
          top: box.initialY,
          left: box.initialX,
          zIndex: boxMode === DrawBoxLayerMode.SELECTED ? 2 : 1,
        }}
        id={box.uuid}
        className={`box ${boxMode}`}
        onMouseDown={handleMouseDown}
        onClick={handleMouseDown}
      />
      {(boxMode === DrawBoxLayerMode.SELECTED ||
        boxMode === DrawBoxLayerMode.RESIZING) && (
        <div
          className="box-size-info"
          style={{
            top: box.initialY + box.height,
            left: box.initialX,
            width: box.width,
          }}
        >
          {box.width} x {box.height}
        </div>
      )}
    </>
  );
}

export default DrawBoxLayer;
