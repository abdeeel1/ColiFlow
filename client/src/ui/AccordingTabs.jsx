import {Accordion} from "@heroui/react";
import { ArrowDown } from "lucide-react";



export default function AccordingTabs({ data }) {
  return (
    <Accordion className="w-full flex flex-col gap-4">
      {data.map((item) => (
        <Accordion.Item key={item.id}>
          <Accordion.Heading>
            <Accordion.Trigger>
              {item.question}
              <Accordion.Indicator className="text-[#636E72]">
                <ArrowDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="text-black">{item.answer}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}