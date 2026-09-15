import {cn} from '@/lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({
  children,
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14',
        className
      )}
    >
      {children}
    </div>
  );
}