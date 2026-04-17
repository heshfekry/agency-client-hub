interface QuoteCategory {
  heading: string;
  bgClass: string;
  textColor: string;
  quotes: string[];
}

const categories: QuoteCategory[] = [
  {
    heading: 'Client expectations',
    bgClass: 'bg-cxl-cyan-light',
    textColor: '#1a6e70',
    quotes: [
      '"Now when I\'m evaluating marketing agencies, a significant factor is how they use AI to speed up the production process and make it more efficient."',
      '"My first consideration is whether I can build an agent in Claude to do the work a marketing agency would have initially done. If not, I\'ll consider the agency."',
      '"They should be able to work at a much faster rate with more consistent output — they can ingest massive amounts of information that previously required a long ramp time."',
      '"Previously it seemed very hard to differentiate agencies, but now you can see which organisations have an AI strategy."',
    ],
  },
  {
    heading: 'Fears & concerns',
    bgClass: 'bg-cxl-red-light',
    textColor: '#7a1219',
    quotes: [
      '"Will AI-related software become so good, at a super low cost, to the point where our high-touch delivery will not matter?"',
      '"My biggest fear is that companies will start to believe AI can replace what we offer. The reality is, it can\'t — AI tends to produce generic recommendations."',
      '"My biggest concerns are not about AI capabilities, but about people misusing AI and developing an overconfidence in it."',
      '"It\'s not always clear which tools to focus on… It\'s honestly a bit overwhelming."',
    ],
  },
  {
    heading: 'How work is changing',
    bgClass: 'bg-cxl-amber-light',
    textColor: '#6a4810',
    quotes: [
      '"A process that took me a week before now takes me a few hours. Content creation time was cut by about 60%."',
      '"Our script writing process — normally 8–16 hours — now takes roughly an hour and a half to two hours."',
      '"AI is a \'garbage in, garbage out\' tool. What used to take our agency a month to audit a client now takes minutes."',
      '"We can onboard a client in days as opposed to weeks. We can launch campaigns with new creative on a weekly basis."',
    ],
  },
  {
    heading: 'Team & internal shifts',
    bgClass: 'bg-cxl-purple-light',
    textColor: '#3a2a8e',
    quotes: [
      '"My employees are resistant to AI at first because they feel like it is a replacement of their job. This improves the more education that is given."',
      '"I have lessened the need for junior employees. I\'d have paid 2–3 junior people and give one very senior person that money."',
      '"Team members that push back on AI use — we help them understand it is now a baseline expectation of our clients and not using it is not an option."',
      '"AI has allowed my shop to remain small, whereas before I needed more contractors to provide services."',
    ],
  },
  {
    heading: 'What skills will matter most',
    bgClass: 'bg-cxl-gray-light',
    textColor: '#3a3a32',
    quotes: [
      '"The most important skill will be the ability to find a specific business problem and implement AI to solve it."',
      '"Critical thinking with no doubt. Even if you\'re not experienced with the subject matter, this skill lets you ask questions and redefine the response direction."',
      '"Flexibility is key since the tools are changing rapidly. What was effective last month may become obsolete this month."',
      '"Having an AI-first mindset is the key for agencies to step out of their comfort zone. The question needs to become a reflex: \'how can AI make this faster?\'"',
    ],
  },
];

const QuotesSection = () => (
  <div>
    <hr className="my-10 border-t border-border" />
    <h2 className="mb-1 font-display text-[22px] text-foreground">Voices from the survey</h2>
    <p className="mb-7 font-body text-[13px] text-muted-foreground">
      What agency leaders and clients are actually saying — in their own words
    </p>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {categories.map((cat) => (
        <div key={cat.heading} className="flex flex-col">
          <div
            className="mb-3 font-display text-[12px] uppercase tracking-[0.08em] leading-tight"
            style={{ color: cat.textColor }}
          >
            {cat.heading}
          </div>
          <div className="flex flex-col gap-2.5">
            {cat.quotes.map((q, i) => (
              <div key={i} className={`rounded-lg p-3 ${cat.bgClass}`}>
                <p
                  className="font-body text-[12px] italic leading-relaxed"
                  style={{ color: cat.textColor }}
                >
                  {q}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default QuotesSection;
