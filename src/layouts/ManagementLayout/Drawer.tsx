import DrawerItem from "./DrawerItem";

import GreenChargingStationIcon from "@/assets/icons/charging-stations.png";
import OverviewIcon from "@/assets/icons/overview.png";
import PollutionReportIcon from "@/assets/icons/pollution-report.png";
import RecyclingCentersIcon from "@/assets/icons/recycling-centers.png";
import styled from "styled-components";
import Typo from "@/components/Typo";

const DRAWER_ITEMS = [
  {
    to: "/",
    label: "Overview",
    icon: OverviewIcon,
  },

  {
    to: "/pollution-reports",
    label: "Pollution Report",
    icon: PollutionReportIcon,
  },
  {
    to: "/recycling-centres",
    label: "Recycling Centres",
    icon: RecyclingCentersIcon,
  },
  {
    to: "/green-charging-stations",
    label: "Green Charging Stations",
    icon: GreenChargingStationIcon,
  },
  // {
  //   to: "/accounts",
  //   label: "Accounts",
  //   icon: AccountIcon,
  // },
];

export default function Drawer() {
  return (
    <S.Drawer>
      {DRAWER_ITEMS.map((item, index) => (
        <DrawerItem key={index} {...item} />
      ))}
    </S.Drawer>
  );
}

namespace S {
  export const Drawer = styled.nav`
    display: flex;
    flex-direction: column;
    padding: var(--s-6);
    margin-top: var(--s-1);
    background-color: var(--c-white);
  `;

  export const Title = styled(Typo)`
    color: var(--c-blue-2);
    margin-bottom: var(--s-3);
  `;
}
