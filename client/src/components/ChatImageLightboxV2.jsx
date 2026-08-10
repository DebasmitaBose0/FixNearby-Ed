export const ChatImageLightboxV2 = ({ src }) => {
  return src ? <div className="lightbox-preview"><img src={src} alt="preview" /></div> : null;
};
