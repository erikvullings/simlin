// Copyright 2021 The Simlin Authors. All rights reserved.
// Use of this source code is governed by the Apache License,
// Version 2.0, that can be found in the LICENSE file.

import * as React from 'react';

import { styled } from '@material-ui/core/styles';

import { createEditor, Descendant, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';

import { CommonLabelProps, LabelPadding, lineSpacing } from './CommonLabel';
import { AuxRadius } from './default';

interface EditingLabelProps extends CommonLabelProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  onDone: (isCancel: boolean) => void;
}

interface EditingLabelState {
  editor: ReactEditor;
}

export const EditableLabel = styled(
  class EditableLabel extends React.PureComponent<EditingLabelProps & { className?: string }, EditingLabelState> {
    constructor(props: EditingLabelProps) {
      super(props);

      this.state = {
        editor: withHistory(withReact(createEditor())),
      };
    }

    handleChange = (value: Descendant[]): void => {
      this.props.onChange(value);
    };

    handlePointerUpDown = (e: React.PointerEvent<HTMLDivElement>): void => {
      e.stopPropagation();
    };

    handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.code === 'Enter' && (e.ctrlKey || e.shiftKey || e.altKey)) {
        e.stopPropagation();
        this.props.onDone(false);
      } else if (e.code === 'Escape') {
        e.stopPropagation();
        this.props.onDone(true);
      }
    };

    render() {
      const lines: string[] = this.props.value.map((n) => Node.string(n));
      const linesCount = lines.length;

      const maxWidthChars = lines.reduce((prev, curr) => (curr.length > prev ? curr.length : prev), 0);
      const editorWidth = maxWidthChars * 6 + 10;

      const { cx, cy, side } = this.props;
      const rw: number = this.props.rw || AuxRadius;
      const rh: number = this.props.rh || AuxRadius;
      let x = cx;
      let y = cy;
      const textX = Math.round(x);
      let textY = y;
      let left = 0;
      let textAlign: 'center' | 'left' | 'right' = 'center';
      switch (side) {
        case 'top':
          y = cy - rh - LabelPadding - lineSpacing * linesCount;
          left = textX - editorWidth / 2;
          textY = y;
          break;
        case 'bottom':
          y = cy + rh + LabelPadding;
          left = textX - editorWidth / 2;
          textY = y;
          break;
        case 'left':
          x = cx - rw - LabelPadding + 1;
          textAlign = 'right';
          left = x - editorWidth;
          textY = y - (12 + (lines.length - 1) * 14) / 2 - 3;
          break;
        case 'right':
          x = cx + rw + LabelPadding - 1;
          textAlign = 'left';
          left = x;
          textY = y - (12 + (lines.length - 1) * 14) / 2 - 3;
          break;
        default:
          // FIXME
          console.log('unknown label case ' + side);
      }

      textY = Math.round(textY);

      /*
        <circle
          cx={textX}
          cy={textY}
          r={2}
          fill={'red'}
          strokeWidth={0}
        /> */

      const style: React.CSSProperties = {
        position: 'relative',
        left,
        top: textY,
        width: editorWidth,
        textAlign,
        lineHeight: '14px',
        background: 'white',
        borderRadius: '3px',
        border: '1px solid #4444dd',
      };

      const { className } = this.props;

      const value: Descendant[] = [
        {
          type: 'equation',
          children: this.props.value as any,
        },
      ];

      return (
        <div
          className={className}
          style={style}
          onPointerDown={this.handlePointerUpDown}
          onPointerUp={this.handlePointerUpDown}
        >
          <Slate editor={this.state.editor} value={value} onChange={this.handleChange}>
            <Editable autoFocus={true} onKeyUp={this.handleKeyPress} />
          </Slate>
        </div>
      );
    }
  },
)(`
    font-size: 12px;
    font-family: "Roboto", "Open Sans", "Arial", sans-serif;
    font-weight: 300;
    text-anchor: middle;
    white-space: nowrap;
    vertical-align: middle;
`);
