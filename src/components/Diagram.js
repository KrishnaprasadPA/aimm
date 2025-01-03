import React, { Component } from "react";
import { dia } from "jointjs";

class Diagram extends Component {
  componentDidMount() {
    const paper = new dia.Paper({
      el: this.diagramContainer,
      width: 800,
      height: 600,
    });

    const rect1 = new dia.Element({
      type: "basic.Rect",
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
      attrs: {
        rect: { fill: "lightblue" },
        text: { text: "Component 1", fill: "black" },
      },
      markup: [
        {
          tagName: "rect",
          selector: "body",
        },
        {
          tagName: "text",
          selector: "label",
        },
      ],
    });

    const rect2 = new dia.Element({
      type: "basic.Rect",
      position: { x: 300, y: 100 },
      size: { width: 200, height: 200 },
      attrs: {
        rect: { fill: "lightgreen" },
        text: { text: "Component 2", fill: "black" },
      },
      markup: [
        {
          tagName: "rect",
          selector: "body",
        },
        {
          tagName: "text",
          selector: "label",
        },
      ],
    });

    const arrow = new dia.Link({
      source: { id: rect1.id },
      target: { id: rect2.id },
    });

    paper.model.addCells([rect1, rect2, arrow]);

    paper.on("element:pointerdown", (elementView) => {
      paper.findViewByModel(elementView.model).startDrag(elementView);
    });
  }

  render() {
    return (
      <div
        ref={(el) => {
          this.diagramContainer = el;
        }}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
}

export default Diagram;
