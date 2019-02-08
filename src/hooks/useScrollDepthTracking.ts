import { useScrollDepth } from './useScrollDepth';

export function useScrollDepthTracking() {
  useScrollDepth([0.4, 0.8], depth => {
    ga('send', 'event', 'post', 'read', 'percentage', depth)
  });
}
