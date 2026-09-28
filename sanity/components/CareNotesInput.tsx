import { useState } from "react";
import { set, useClient, useFormValue, type ArrayOfObjectsInputProps } from "sanity";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";

const key = () => Math.random().toString(36).slice(2, 10);

/**
 * The care notes list, with a "Draft care notes" button above it. The draft
 * is written from the garment, fabric and "What I did" fields on this card,
 * in Grace's voice, and lands as ordinary editable sections.
 */
export function CareNotesInput(props: ArrayOfObjectsInputProps) {
  const garment = useFormValue(["garment"]) as string | undefined;
  const fabric = useFormValue(["fabric"]) as string | undefined;
  const workDone = useFormValue(["workDone"]) as string | undefined;
  // The editor's own sign-in token; the route checks it with Sanity before drafting.
  const token = useClient({ apiVersion: "2024-01-01" }).config().token;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const hasNotes = Array.isArray(props.value) && props.value.length > 0;

  const draft = async () => {
    if (hasNotes && !window.confirm("Replace the care notes that are here now with a new draft?")) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/care-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ garment, fabric, workDone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.sections)) {
        setMessage(data.error ?? "The draft didn't come through. Try again in a minute.");
        return;
      }
      props.onChange(
        set(
          data.sections.map((s: { heading: string; body: string }) => ({
            _type: "careSection",
            _key: key(),
            heading: s.heading,
            body: s.body,
          }))
        )
      );
      setMessage("Drafted. Read it through and change anything that isn't how you'd say it.");
    } catch {
      setMessage("The draft didn't come through. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} tone="primary" border>
        <Flex align="center" gap={3} wrap="wrap">
          <Button
            text={hasNotes ? "Draft new care notes" : "Draft care notes"}
            tone="primary"
            onClick={draft}
            loading={busy}
            disabled={busy || !garment}
          />
          <Text size={1} muted>
            {garment
              ? `Written for: ${[garment, fabric].filter(Boolean).join(", ")}`
              : "Fill in Garment first (and Fabric, if you can)."}
          </Text>
        </Flex>
        {message && (
          <Text size={1} style={{ marginTop: 12 }}>
            {message}
          </Text>
        )}
      </Card>
      {props.renderDefault(props)}
    </Stack>
  );
}
