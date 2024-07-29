import { Navbar } from '@/components/navbar';

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <main className="w-screen">
        <h1>John Due</h1>
        <p>Nickname: John#{params.id}</p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel
          laudantium eveniet neque voluptatum, saepe fugit autem dolorum sed.
          Cupiditate aliquid repudiandae debitis dolorum suscipit aut esse eaque
          minus laboriosam et.
        </p>
      </main>
    </>
  );
}
