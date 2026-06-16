import React, { useState } from 'react';

function SidebarLinkGroup({
  children,
  activecondition,
}) {

  const [open, setOpen] = useState(activecondition);

  const handleClick = () => {
    setOpen(!open);
  }

  return (
    <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 ${activecondition ? 'bg-linear-to-r from-[#0984E3]/12 dark:from-[#0984E3]/24 to-violet-500/4' : ''}`}>
      {children(handleClick, open)}
    </li>
  );
}

export default SidebarLinkGroup;