import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can parents have multiple wards?",
    answer:
      "Yes. A single parent account can be linked to multiple students. Each parent has a unified dashboard showing all their children with per-ward access control.",
  },
  {
    question: "Can I disable a user without deleting them?",
    answer:
      "Yes. This preserves all historical data while preventing login access.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl text-center mb-12">
        <abbr className="space-y-4 text-center no-underline" title="Frequently asked questions">
            FAQs
        </abbr>
          </h2>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg border bg-background px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
