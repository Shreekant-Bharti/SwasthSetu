// Sound utilities for order status changes

export const playSuccessSound = () => {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNw==');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

export const playCancelSound = () => {
  // A different tone for cancellation
  const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleQQAAABAEAQB8AAEAfAAABAAgA2F1fdWF0YRdGRl9vT19tWF0AQAABAAEAQB8AAEAfAAABAAgA2F1fdWF0YYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt');
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

export const playOrderSound = () => {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyU4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBT2U4PbLcyYFLIHO8tiJNw==');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};
