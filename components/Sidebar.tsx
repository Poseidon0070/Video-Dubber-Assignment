'use client'
import { useState } from 'react';
import { Center, Tooltip, UnstyledButton, Stack, rem } from '@mantine/core';
import {
  IconHome2,
  IconGauge,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconCalendarStats,
  IconUser,
  IconSettings,
  IconLogout,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import classes from './Sidebar.module.css';
import { FiAlignJustify } from "react-icons/fi";
import { RiScissors2Fill } from "react-icons/ri";
import { MdOutlineSwitchAccessShortcut } from "react-icons/md";
import { SiTrailforks } from "react-icons/si";
import { GiMoebiusTriangle } from "react-icons/gi";
import { GiPrism } from "react-icons/gi";
import { GiJoin } from "react-icons/gi";
import { SlCamrecorder } from "react-icons/sl";
import { IoMdDisc } from "react-icons/io";
import { MdContactSupport } from "react-icons/md";
import { FaFlagUsa } from "react-icons/fa6";
import Link from 'next/link';

interface NavbarLinkProps {
    icon: any;
    label: string;
    href: string;
    name: string; // Add this line
    active?: boolean;
    onClick?(): void;
  }
  

  function NavbarLink({ icon: Icon, href, label, name, active, onClick }: NavbarLinkProps) {
    return (
        <div>
            <Link href={href}>
            <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
                <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
                <Stack align="center">
                    <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
                    <span className={classes.name}>{name}</span>
                </Stack>
                </UnstyledButton>
            </Tooltip>
        </Link>
      </div>
    );
  }
  

const mockdata = [
    { icon: RiScissors2Fill, href:'/cutter', label: 'Cutter', name: 'Cutter' },
    { icon: MdOutlineSwitchAccessShortcut, href:'/', label: 'Remover', name: 'Remover' },
    { icon: GiPrism, href:'/', label: 'Splitter', name: 'Splitter' },
    { icon: SiTrailforks, href:'/', label: 'Pitcher', name: 'Pitcher' },
    { icon: GiMoebiusTriangle, href:'/', label: 'BPM Finder', name: 'BPM Finder' },
    { icon: GiJoin, href:'/', label: 'Joiner', name: 'Joiner' },
    { icon: SlCamrecorder, href:'/', label: 'Recorder', name: 'Recorder' },
    { icon: IoMdDisc, href:'/', label: 'Karaoke', name: 'Karaoke' },
  ];
  

export default function NavbarMinimal() {
  const [active, setActive] = useState<number | null>(null);
  let [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)
  function handleClick(index:number) {
    setActive(index)

  }

  const links = mockdata.map((link, index) => (
    // @ts-ignore
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));
  

  function toggleSidebar() {
    setSidebarOpen(prevState => !prevState)
  }

  return (
    <>
    <FiAlignJustify className={classes['nav-controller']}  onClick={toggleSidebar}/>
    {isSidebarOpen && 
        <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
            <Stack justify="center" gap={0}>
                {links}
            </Stack>
        </div>
        <Stack justify="center" gap={0}>
            <NavbarLink href='/' name= 'Support' icon={MdContactSupport} label="Change account" />
            <NavbarLink href='/' name= 'Language' icon={FaFlagUsa} label="Logout" />
        </Stack>
        </nav>
    }
    </>
  );
}