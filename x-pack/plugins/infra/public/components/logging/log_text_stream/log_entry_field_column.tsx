/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import stringify from 'json-stable-stringify';
import React, { useMemo } from 'react';

import { euiStyled } from '../../../../../observability/public';
import {
  isFieldColumn,
  isHighlightFieldColumn,
  LogEntryColumn,
  LogEntryHighlightColumn,
} from '../../../utils/log_entry';
import { ActiveHighlightMarker, highlightFieldValue, HighlightMarker } from './highlighting';
import { LogEntryColumnContent } from './log_entry_column';
import {
  hoveredContentStyle,
  longWrappedContentStyle,
  preWrappedContentStyle,
  unwrappedContentStyle,
  WrapMode,
} from './text_styles';

interface LogEntryFieldColumnProps {
  columnValue: LogEntryColumn;
  highlights: LogEntryHighlightColumn[];
  isActiveHighlight: boolean;
  isHighlighted: boolean;
  isHovered: boolean;
  wrapMode: WrapMode;
}

export const LogEntryFieldColumn: React.FunctionComponent<LogEntryFieldColumnProps> = ({
  columnValue,
  highlights: [firstHighlight], // we only support one highlight for now
  isActiveHighlight,
  isHighlighted,
  isHovered,
  wrapMode,
}) => {
  const value = useMemo(() => (isFieldColumn(columnValue) ? JSON.parse(columnValue.value) : null), [
    columnValue,
  ]);
  const formattedValue = Array.isArray(value) ? (
    <ul>
      {value.map((entry, i) => (
        <CommaSeparatedLi key={`LogEntryFieldColumn-${i}`}>
          {highlightFieldValue(
            entry,
            isHighlightFieldColumn(firstHighlight) ? firstHighlight.highlights : [],
            isActiveHighlight ? ActiveHighlightMarker : HighlightMarker
          )}
        </CommaSeparatedLi>
      ))}
    </ul>
  ) : (
    highlightFieldValue(
      typeof value === 'object' && value != null ? stringify(value) : value,
      isHighlightFieldColumn(firstHighlight) ? firstHighlight.highlights : [],
      isActiveHighlight ? ActiveHighlightMarker : HighlightMarker
    )
  );

  return (
    <FieldColumnContent isHighlighted={isHighlighted} isHovered={isHovered} wrapMode={wrapMode}>
      {formattedValue}
    </FieldColumnContent>
  );
};

const CommaSeparatedLi = euiStyled.li`
  display: inline;
  &:not(:last-child) {
    margin-right: 1ex;
    &::after {
      content: ',';
    }
  }
`;

interface LogEntryColumnContentProps {
  isHighlighted: boolean;
  isHovered: boolean;
  wrapMode: WrapMode;
}

const FieldColumnContent = euiStyled(LogEntryColumnContent)<LogEntryColumnContentProps>`
  text-overflow: ellipsis;

  ${props => (props.isHovered || props.isHighlighted ? hoveredContentStyle : '')};
  ${props =>
    props.wrapMode === 'long'
      ? longWrappedContentStyle
      : props.wrapMode === 'pre-wrapped'
      ? preWrappedContentStyle
      : unwrappedContentStyle};
`;
