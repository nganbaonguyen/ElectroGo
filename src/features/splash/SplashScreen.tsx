import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {colors, radius} from '../../shared/theme';

const LOGO_SIZE = 150;
// Tổng thời gian splash = INTRO_MS + HOLD_MS + FADE_OUT_MS ≈ 1 giây
const INTRO_MS = 400; // logo bật lên
const HOLD_MS = 300; // giữ logo trước khi mờ dần
const FADE_OUT_MS = 300;

type Props = {
  /** Gọi khi splash đã mờ hẳn, lúc đó nên gỡ splash khỏi cây giao diện. */
  onFinish: () => void;
};

/**
 * Splash có animation: logo bật lên (scale + fade), vòng sáng lan tỏa phía sau,
 * giữ một lúc rồi cả màn hình mờ dần để lộ màn hình phía dưới.
 */
export default function SplashScreen({onFinish}: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const haloLoop = Animated.loop(
      Animated.timing(halo, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );

    const intro = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: INTRO_MS,
        useNativeDriver: true,
      }),
      // Dùng timing + back thay cho spring để thời lượng cố định, đúng 1 giây
      Animated.timing(logoScale, {
        toValue: 1,
        duration: INTRO_MS,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
    ]);

    const sequence = Animated.sequence([
      intro,
      Animated.delay(HOLD_MS),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]);

    haloLoop.start();
    sequence.start(({finished}) => {
      haloLoop.stop();
      if (finished) {
        onFinish();
      }
    });

    return () => {
      haloLoop.stop();
      sequence.stop();
    };
  }, [halo, logoOpacity, logoScale, onFinish, screenOpacity]);

  const haloScale = halo.interpolate({inputRange: [0, 1], outputRange: [1, 2.1]});
  const haloOpacity = halo.interpolate({inputRange: [0, 1], outputRange: [0.35, 0]});

  return (
    <Animated.View style={[styles.container, {opacity: screenOpacity}]}>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.halo,
            {opacity: haloOpacity, transform: [{scale: haloScale}]},
          ]}
        />
        <Animated.Image
          source={require('../../assets/images/logo.png')}
          style={[
            styles.logo,
            {opacity: logoOpacity, transform: [{scale: logoScale}]},
          ]}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {alignItems: 'center', justifyContent: 'center'},
  halo: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  logo: {width: LOGO_SIZE, height: LOGO_SIZE},
});
