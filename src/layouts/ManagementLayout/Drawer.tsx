import DrawerItem from "./DrawerItem";

import ParkingLotApprovalIcon from "@/assets/icons/parking-lot-approval.png";
import OverviewIcon from "@/assets/icons/overview.png";
import SystemMetricsIcon from "@/assets/icons/system-metrics.png";
import PayrollIcon from "@/assets/icons/payroll.png";
import styled from "styled-components";
import Typo from "@/components/Typo";

const DRAWER_ITEMS = [
  {
    to: "/",
    label: "Overview",
    icon: OverviewIcon,
  },
  {
    to: "/system-metrics",
    label: "System Metrics",
    icon: SystemMetricsIcon,
  },
  {
    to: "/parking-lots",
    label: "Parking Lots",
    icon: ParkingLotApprovalIcon,
  },
  {
    to: "/payout",
    label: "Payout",
    icon: PayrollIcon,
  },
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
    background-color: var(--c-white-5);
  `;

  export const Title = styled(Typo)`
    color: var(--c-blue-2);
    margin-bottom: var(--s-3);
  `;
}
