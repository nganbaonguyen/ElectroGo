import React, {useEffect, useRef} from 'react';
import {Animated, Platform, StyleProp, View, ViewStyle} from 'react-native';

type Props = {
  /** Thứ tự của khối trong trang, khối sau hiện trễ hơn khối trước một chút. */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

const STEP_MS = 70;
const DURATION_MS = 420;

// Android vẽ sai bóng đổ (elevation) của thẻ con khi lớp cha đang đổi opacity: lộ viền tối/nâu quanh thẻ
// trong lúc hiện dần. Nên trên Android hiện thẳng, không animation.
const ANIMATE = Platform.OS !== 'android';

/**
 * Hiện dần và trượt nhẹ từ dưới lên khi mở màn hình (chỉ iOS). Các khối hiện lần lượt tạo cảm giác mượt.
 * Android: hiện ngay, không hiệu ứng (xem ANIMATE).
 */
export default function FadeInView(props: Props) {
  if (!ANIMATE) {
    return <View style={props.style}>{props.children}</View>;
  }
  return <AnimatedFadeIn {...props} />;
}

function AnimatedFadeIn({index = 0, style, children}: Props) {
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
