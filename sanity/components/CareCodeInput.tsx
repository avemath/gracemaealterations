import { useState } from "react";
import type { StringInputProps } from "sanity";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";

/**
 * Shows the card's private link with the two things Grace needs: open the
 * page, and print the card with its QR code. The page reads the published
 * version, so both work once the card is published.
 */
export function CareCodeInput(props: StringInputProps) {
  const code = props.value;
  const [copied, setCopied] = useState(false);
  if (!code) return props.renderDefault(props);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://gracemaealterations.com";
  const url = `${origin}/care/${code}`;

  return (
    <Card padding={3} radius={2} border>
      <Stack space={3}>
        <Text size={1} muted style={{ wordBreak: "break-all" }}>
          {url}
        </Text>
        <Flex gap={2} wrap="wrap">
          <Button as="a" href={`/care/${code}/card`} target="_blank" rel="noopener" text="Print the card" tone="primary" />
          <Button as="a" href={`/care/${code}`} target="_blank" rel="noopener" text="Open the page" mode="ghost" />
          <Button
            mode="ghost"
            text={copied ? "Copied" : "Copy link"}
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          />
        </Flex>
        <Text size={1} muted>
          Publish the card first. After you publish, the page can take up to a minute to appear.
        </Text>
      </Stack>
    </Card>
  );
}
