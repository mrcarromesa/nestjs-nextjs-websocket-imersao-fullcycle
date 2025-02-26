import { Asset } from "@/models";
import Image from "next/image";

export function AssetShow({ asset }: { asset: Asset}) {
  return (
    <div className="flex space-x-1">
      <div className="content-center">
        <Image
          src={asset.image_url}
          alt={asset.symbol}
          height={30}
          width={30}
        />
      </div>
      <div className="flex flex-col text-sm">
        <span>{asset.name}</span>
        <span>{asset.symbol}</span>
      </div>
    </div>
  )
}