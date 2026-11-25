import React, {useEffect, useRef} from 'react';
import {Animated, StyleProp, ViewStyle} from 'react-native';

type Props = {
  /** Thứ tự của khối trong trang, khối sau hiện trễ hơn khối trước một chút. */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

const STEP_MS = 70;
const DURATION_MS = 420;

/** Hiện dần và trượt nhẹ từ dưới lên khi mở màn hình. Các khối hiện lần lượt tạo cảm giác mượt. */
export default function FadeInView({index = 0, style, children}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      delay: index * STEP_MS,
      useNativeDriver: true,
    }).start();
  }, [index, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{translateY: progress.interpolate({inputRange: [0, 1], outputRange: [18, 0]})}],
        },
      ]}>
      {children}
    </Animated.View>
  );
}
