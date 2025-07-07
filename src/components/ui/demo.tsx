import { Card, CardCanvas } from "@/components/ui/animated-glow-card";
import { XCard } from "@/components/ui/x-gradient-card";
import { GlowEffect } from '@/components/ui/glow-effect';

const XCardDummyData = {
    authorName: "EaseMise",
    authorHandle: "easemize",
    authorImage: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    content: [
        "The Outer container with border and dots its the actual Card",
        "Wrap it around anything to have a cool card like this",
    ],
    isVerified: true,
    timestamp: "Today",
    reply: {
        authorName: "GoodGuy",
        authorHandle: "gdguy",
        authorImage: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        content: "Its Easy to Use great to customize",
        isVerified: true,
        timestamp: "10 minutes ago",
    },
};

function XCardDemoDefault() {
    return <XCard {...XCardDummyData} />
}

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center bg-black">
      <CardCanvas>
        <Card className="w-auto p-6">
          <div className="dark">
            <XCard {...XCardDummyData} />
          </div>
        </Card>
      </CardCanvas>
    </div>
  );
};

export function GlowEffectCardBackground() {
  return (
    <div className='relative h-44 w-64'>
      <GlowEffect
        colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
        mode='static'
        blur='medium'
      />
      <div className='relative h-44 w-64 rounded-lg bg-black p-2 text-white dark:bg-white dark:text-black'>
        <svg
          role='img'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 70 70'
          aria-label='MP Logo'
          width='70'
          height='70'
          className='absolute bottom-4 right-4 h-8 w-8'
          fill='none'
        >
          <path
            stroke='currentColor'
            strokeLinecap='round'
            strokeWidth='3'
            d='M51.883 26.495c-7.277-4.124-18.08-7.004-26.519-7.425-2.357-.118-4.407-.244-6.364 1.06M59.642 51c-10.47-7.25-26.594-13.426-39.514-15.664-3.61-.625-6.744-1.202-9.991.263'
          ></path>
        </svg>
      </div>
    </div>
  );
}

export { DemoOne, XCardDemoDefault };