export const useHideScrollbar = () => {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  const disableScroll = () => {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const enableScroll = () => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };
  return { disableScroll, enableScroll };
};
