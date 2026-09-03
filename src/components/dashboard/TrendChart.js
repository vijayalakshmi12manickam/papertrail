import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../lib/format';

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default function TrendChart({ totals, currency, height = 180 }) {
  const { theme } = useAppTheme();
  const width = 320;
  const paddingLeft = 8;
  const paddingRight = 8;
  const paddingTop = 16;
  const paddingBottom = 24;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const max = Math.max(...totals, 1);
  const stepX = chartW / (totals.length - 1);

  const points = totals.map((v, i) => {
    const x = paddingLeft + i * stepX;
    const y = paddingTop + chartH - (v / max) * chartH;
    return { x, y, v };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  if (totals.every((v) => v === 0)) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
          No spending data for this year yet.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* baseline */}
        <Line
          x1={paddingLeft}
          y1={paddingTop + chartH}
          x2={width - paddingRight}
          y2={paddingTop + chartH}
          stroke={theme.colors.border}
          strokeWidth={1}
        />
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={theme.colors.accent}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={p.v > 0 ? 3 : 0} fill={theme.colors.accent} />
        ))}
        {MONTH_LABELS.map((label, i) => (
          <SvgText
            key={i}
            x={paddingLeft + i * stepX}
            y={height - 4}
            fontSize={9}
            fill={theme.colors.textMuted}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>
      <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]}>
        Peak month: {formatCurrency(max, currency)}
      </Text>
    </View>
  );
}
