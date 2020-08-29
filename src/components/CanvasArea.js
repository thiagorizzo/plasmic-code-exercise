import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import DrawBoxLayer, {
  DrawBoxLayerMode,
  DrawBoxResizeSide,
} from "./DrawBoxLayer";
import CursorStyle from "../enums/CursorStyle";
import "./CanvasArea.css";

function CanvasArea({ width, height }) {
  const canvasAreaEl = useRef(null);

  const [layers, setLayers] = useState([]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState();
  const [initialX, setInitialX] = useState();
  const [initialY, setInitialY] = useState();
  const [initialHeight, setInitialHeight] = useState();
  const [initialWidth, setInitialWidth] = useState();
  const [drawingBox, setDrawingBox] = useState();
  const [selectedBox, setSelectedBox] = useState();
  const [cursor, setCursor] = useState(CursorStyle.DEFAULT);
  const [resizeSide, setResizeSide] = useState();
  const [resizingBox, setResizingBox] = useState();
  const [event, setEvent] = useState();

  function getRelativeCoordinates(event, referenceElement) {
    const position = {
      x: event.pageX,
      y: event.pageY,
    };

    const offset = {
      left: referenceElement.offsetLeft,
      top: referenceElement.offsetTop,
    };

    let reference = referenceElement.offsetParent;

    while (reference) {
      offset.left += reference.offsetLeft;
      offset.top += reference.offsetTop;
      reference = reference.offsetParent;
    }

    return {
      x: position.x - offset.left,
      y: position.y - offset.top,
    };
  }

  function handleMouseMove(e) {
    if (isDrawing) {
      setCursor(CursorStyle.CROSSHAIR);
      const { x, y } = getRelativeCoordinates(e, canvasAreaEl.current);
      const box = new Box(initialX, initialY, x, y);
      setDrawingBox(box);
    } else if (isMoving) {
      setCursor(CursorStyle.MOVE);
      const { x, y } = { x: e.clientX - initialX, y: e.clientY - initialY };
      setSelectedBox(
        new Box(x, y, x + selectedBox.width, y + selectedBox.height)
      );
    } else if (isResizing) {
      switch (resizeSide) {
        case DrawBoxResizeSide.TOP_LEFT:
          setCursor(CursorStyle.RESIZE_TOP_LEFT);
          {
            const { x1, y1 } = { x1: e.clientX, y1: e.clientY };
            const { x2, y2 } = {
              x2: initialX + initialWidth,
              y2: initialY + initialHeight,
            };
            setResizingBox(new Box(x1, y1, x2, y2));
          }
          break;

        case DrawBoxResizeSide.TOP_RIGHT:
          setCursor(CursorStyle.RESIZE_TOP_RIGHT);
          {
            const { x1, y1 } = { x1: e.clientX, y1: e.clientY };
            const { x2, y2 } = {
              x2: initialX - initialWidth,
              y2: initialY + initialHeight,
            };
            setResizingBox(new Box(x1, y1, x2, y2));
          }
          break;

        case DrawBoxResizeSide.BOTTOM_LEFT:
          setCursor(CursorStyle.RESIZE_BOTTOM_LEFT);
          {
            const { x1, y1 } = { x1: e.clientX, y1: e.clientY };
            const { x2, y2 } = {
              x2: initialX + initialWidth,
              y2: initialY - initialHeight,
            };
            setResizingBox(new Box(x1, y1, x2, y2));
          }
          break;

        default:
          {
            setCursor(CursorStyle.RESIZE_BOTTOM_RIGHT);
            const { x1, y1 } = { x1: e.clientX, y1: e.clientY };
            const { x2, y2 } = {
              x2: initialX - initialWidth,
              y2: initialY - initialHeight,
            };
            setResizingBox(new Box(x1, y1, x2, y2));
          }
          break;
      }
    }
  }

  function handleMouseUp(e) {
    if (isDrawing && !selectedBox) {
      if (drawingBox) {
        setLayers([...layers, drawingBox]);
        setSelectedBox(drawingBox);
        setDrawingBox(undefined);
      }
    } else {
      if (isMoving) {
        setLayers([...layers, selectedBox]);
      } else if (isResizing) {
        setLayers([...layers, resizingBox]);
        setSelectedBox(resizingBox);
      }
    }
    setCursor(CursorStyle.DEFAULT);
    setIsDrawing(false);
    setIsMoving(false);
    setIsResizing(false);
    setResizeSide(undefined);
    setResizingBox(undefined);
  }

  function handleMouseDown(e) {
    setInitialX(e.nativeEvent.offsetX);
    setInitialY(e.nativeEvent.offsetY);

    if (e.target === canvasAreaEl.current) {
      setIsDrawing(true);
      setIsMoving(false);
      setIsResizing(false);
      setSelectedBox(undefined);
      setResizeSide(undefined);
      setResizingBox(undefined);
    } else {
      if (!selectedBox || selectedBox.uuid !== e.target.id) {
        setIsDrawing(false);
        setIsMoving(false);
        setIsResizing(false);
        setSelectedBox(undefined);
        setResizeSide(undefined);
        setResizingBox(undefined);
      } else {
        if (resizeSide) {
          setInitialX(e.clientX);
          setInitialY(e.clientY);
          setInitialWidth(selectedBox.width);
          setInitialHeight(selectedBox.height);
          setIsResizing(true);
          setResizingBox(selectedBox);
          setLayers(layers.filter((l) => l.uuid !== selectedBox.uuid));
        } else {
          setIsMoving(true);
          setResizeSide(undefined);
          setResizingBox(undefined);
          setLayers(layers.filter((l) => l.uuid !== selectedBox.uuid));
        }
      }
    }
  }

  useEffect(() => {
    if (event) {
      handleMouseDown(event);
    }
  }, [event]);

  function handleBoxResize(e, resizeSide) {
    setResizeSide(resizeSide);
    setEvent({ ...e });
  }

  function handleBoxSelected(e, box) {
    setSelectedBox(box);
    setEvent({ ...e });
  }

  function handleKeyDown(e) {
    if (selectedBox && e.keyCode === 46) {
      setLayers(layers.filter((l) => l.uuid !== selectedBox.uuid));
    }
  }

  return (
    <>
      <div
        className="canvas-area"
        style={{
          height: height,
          width: width,
          cursor: cursor,
          backgroundColor: isDrawing ? "#F8F8F8" : "",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onKeyUp={handleKeyDown}
        ref={canvasAreaEl}
        tabIndex={0}
      >
        {layers &&
          layers.map((l) => {
            return (
              <DrawBoxLayer
                key={l.uuid}
                boxLayer={l}
                mode={
                  selectedBox && selectedBox.uuid === l.uuid
                    ? DrawBoxLayerMode.SELECTED
                    : DrawBoxLayerMode.STATIC
                }
                onBoxSelected={handleBoxSelected}
                onBoxResize={handleBoxResize}
              ></DrawBoxLayer>
            );
          })}
        {selectedBox && isMoving && (
          <DrawBoxLayer
            boxLayer={selectedBox}
            mode={DrawBoxLayerMode.MOVING}
          ></DrawBoxLayer>
        )}
        {drawingBox && (
          <DrawBoxLayer
            boxLayer={drawingBox}
            mode={DrawBoxLayerMode.DRAWING}
          ></DrawBoxLayer>
        )}
        {resizingBox && (
          <DrawBoxLayer
            boxLayer={resizingBox}
            mode={DrawBoxLayerMode.RESIZING}
          ></DrawBoxLayer>
        )}
      </div>
    </>
  );
}

class Box {
  constructor(x1, y1, x2, y2) {
    this.uuid = uuidv4();
    this.refreshValues(x1, y1, x2, y2);
  }

  refreshValues(x1, y1, x2, y2) {
    this.initialX = x1 <= x2 ? x1 : x2;
    this.initialY = y1 <= y2 ? y1 : y2;
    this.finalX = x1 > x2 ? x1 : x2;
    this.finalY = y1 > y2 ? y1 : y2;
    this.width = this.finalX - this.initialX;
    this.height = this.finalY - this.initialY;
  }
}

export default CanvasArea;
