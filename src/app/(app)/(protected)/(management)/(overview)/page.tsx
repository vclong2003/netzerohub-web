"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { Card, Col, Row, Tag } from "antd";
import { IoArrowForward } from "react-icons/io5";

import GreenChargingStationIcon from "@/assets/icons/charging-stations.png";
import PollutionReportIcon from "@/assets/icons/pollution-report.png";
import RecyclingCentersIcon from "@/assets/icons/recycling-centers.png";
import Typo from "@/components/Typo";
import Button from "@/components/Button";

export default function Overview() {
  const router = useRouter();

  return (
    <S.Container>
      <S.HeroCard>
        <S.HeroHeader>
          <S.Title variant="h4">Services Overview</S.Title>
        </S.HeroHeader>
      </S.HeroCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <S.ServiceCard>
            <S.CardTop>
              <S.IconWrap>
                <Image
                  src={RecyclingCentersIcon}
                  alt="Recycling Centres"
                  width={22}
                  height={22}
                  style={{ objectFit: "contain" }}
                />
              </S.IconWrap>
              <Tag color="blue">Wollongong Council</Tag>
            </S.CardTop>
            <S.ServiceTitle variant="h5">Recycling Centres</S.ServiceTitle>
            <S.BulletList>
              <li>Local community recycling facilities</li>
              <li>Accepted waste types filter (glass, e-waste, etc.)</li>
              <li>Operating hours & site images</li>
              <li>PDF info sheets</li>
            </S.BulletList>
            <S.CardFooter>
              <Button
                size="medium"
                onClick={() => router.push("/recycling-centres")}>
                <span>Open Centres</span>
                <IoArrowForward size={14} style={{ marginLeft: 6 }} />
              </Button>
            </S.CardFooter>
          </S.ServiceCard>
        </Col>

        <Col xs={24} md={8}>
          <S.ServiceCard>
            <S.CardTop>
              <S.IconWrap>
                <Image
                  src={GreenChargingStationIcon}
                  alt="Green Charging Stations"
                  width={22}
                  height={22}
                  style={{ objectFit: "contain" }}
                />
              </S.IconWrap>
              <Tag color="green">NRMA</Tag>
            </S.CardTop>
            <S.ServiceTitle variant="h5">
              Green Charging Stations
            </S.ServiceTitle>
            <S.BulletList>
              <li>EV charging stations directory & search</li>
              <li>% Renewable energy tracking</li>
              <li>Plugs management (Type 2, CCS, CHAdeMO)</li>
              <li>Station coordinates & map routing</li>
            </S.BulletList>
            <S.CardFooter>
              <Button
                size="medium"
                onClick={() => router.push("/green-charging-stations")}>
                <span>Open Stations</span>
                <IoArrowForward size={14} style={{ marginLeft: 6 }} />
              </Button>
            </S.CardFooter>
          </S.ServiceCard>
        </Col>

        <Col xs={24} md={8}>
          <S.ServiceCard>
            <S.CardTop>
              <S.IconWrap>
                <Image
                  src={PollutionReportIcon}
                  alt="Pollution Report"
                  width={22}
                  height={22}
                  style={{ objectFit: "contain" }}
                />
              </S.IconWrap>
              <Tag color="volcano">NSW EPA</Tag>
            </S.CardTop>
            <S.ServiceTitle variant="h5">Pollution Reports</S.ServiceTitle>
            <S.BulletList>
              <li>Incident reporting with photos & location</li>
              <li>Categorization (litter, water, air, land, noise)</li>
              <li>EPA staff review, status updates & PDF export</li>
              <li>Email notifications to citizens</li>
            </S.BulletList>
            <S.CardFooter>
              <Button
                size="medium"
                onClick={() => router.push("/pollution-reports")}>
                <span>Open Reports</span>
                <IoArrowForward size={14} style={{ marginLeft: 6 }} />
              </Button>
            </S.CardFooter>
          </S.ServiceCard>
        </Col>
      </Row>
    </S.Container>
  );
}

namespace S {
  export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--s-4);
    padding: var(--s-2) 0 var(--s-6) 0;
  `;

  export const HeroCard = styled(Card)`
    border-radius: var(--br-3);
    border: none;
    box-shadow: none;
    padding: 0;

    .ant-card-body {
      padding: var(--s-4) var(--s-5);
    }
  `;

  export const HeroHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `;

  export const Title = styled(Typo)`
    color: var(--c-green-8);
  `;

  export const ServiceCard = styled(Card)`
    border-radius: var(--br-3);
    border: none;
    box-shadow: none;
    height: 100%;
    display: flex;
    flex-direction: column;

    .ant-card-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: var(--s-4);
    }
  `;

  export const CardTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--s-2);
  `;

  export const IconWrap = styled.div`
    width: 36px;
    height: 36px;
    border-radius: var(--br-2);
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  export const ServiceTitle = styled(Typo)`
    color: var(--c-black);
    font-weight: var(--fw-medium);
    margin-bottom: var(--s-2);
  `;

  export const BulletList = styled.ul`
    margin: 0;
    padding-left: var(--s-4);
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    font-size: var(--fs-body1);
    color: var(--c-gray);
    flex: 1;

    li {
      line-height: 1.5;
    }
  `;

  export const CardFooter = styled.div`
    margin-top: var(--s-4);
    display: flex;

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  `;
}
