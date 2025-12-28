import React from 'react';
import { MdVerified } from 'react-icons/md';

const VerifiedBadge = ({ role }) => {
    if (role !== 'admin') return null;
    return <MdVerified className="text-primary ms-1" title="Verified Admin" />;
};

export default VerifiedBadge;
