import React from 'react';

const AuthSplitCard = ({ children }) => {
  return (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: '920px',
        background: '#F5F7FB',
        border: '1px solid #D6DEE9',
        borderRadius: '18px',
        padding: 'clamp(20px, 4vw, 34px)',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.12)',
      }}
    >
      {children}
    </div>
  );
};

export default AuthSplitCard;
