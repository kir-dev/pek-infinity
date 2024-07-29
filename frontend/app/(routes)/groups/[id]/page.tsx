import { Navbar } from '@/components/navbar';

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <main className="w-screen">
        <h1>Group {params.id}</h1>
        <p>Alapítás éve: 2003</p>
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
