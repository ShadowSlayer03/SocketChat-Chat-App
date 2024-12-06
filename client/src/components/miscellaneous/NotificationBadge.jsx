import { useSpring, animated } from 'react-spring';

const NotificationBadge = ({ count }) => {
  const styles = useSpring({
    transform: count > 0 ? 'scale(1.2)' : 'scale(1)',
    config: { tension: 300, friction: 10 },
  });

  console.log("whassup")

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {count > 0 && (
        <animated.div
          style={{
            ...styles,
            fontSize: '8px',
            fontFamily: 'Varela Round',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: -30,
            right: -2,
            background: 'red',
            borderRadius: '50%',
            color: 'white',
            padding: '2px 6px',
          }}
        >
          {count}
        </animated.div>
      )}
    </div>
  );
};

export default NotificationBadge;