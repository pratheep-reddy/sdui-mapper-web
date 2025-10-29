import Image from 'next/image';
import { BodyText } from './Text';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 h-16">
          <Image
            src="https://images.ixigo.com/image/upload/Header/aac1498d8f956aa99344f08773c70fb6-evncq.webp"
            alt="Logo"
            width={80}
            height={32}
            className="object-contain"
            priority
          />
          <BodyText weight="semibold" color="#ec5b24" className="tracking-wide">
            SDUI Playground
          </BodyText>
        </div>
      </div>
    </header>
  );
}

