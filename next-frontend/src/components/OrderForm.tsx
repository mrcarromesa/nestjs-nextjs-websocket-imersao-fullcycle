"use client";

import { Button, Label, TextInput } from "flowbite-react";
import { Asset, Order, OrderType } from "../models";
import { FormEvent } from "react";
import { socket } from "../socket-io";
import { toast } from "react-toastify";

//server component vs client component;

export function OrderForm(
  props: Readonly<{
    asset: Asset;
    walletId: string;
    type: OrderType;
  }>
) {
  const color = props.type === OrderType.BUY ? "text-blue-700" : "text-red-700";
  const translatedType = props.type === OrderType.BUY ? "compra" : "venda";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("type", props.type);
    formData.set("assetId", props.asset._id);
    formData.set("walletId", props.walletId);
    const data = Object.fromEntries(formData.entries());
    socket.connect();
    const newOrder: Order = await socket.emitWithAck("orders/create", data); // Aguardar retorno do servidor, se só enviar o emit ele não aguarda o retorno
    toast(
      `Ordem de ${translatedType} de ${newOrder.shares} ações de ${props.asset.symbol} criada com sucesso`,
      { type: "success", position: "top-right" }
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <div className="mb-2">
          <Label htmlFor="shares" value="Quantidade" className={color} />
        </div>
        <TextInput
          id="shares"
          name="shares"
          required
          type="number"
          min={1}
          step={1}
          defaultValue={1}
          color={props.type == OrderType.BUY ? "info" : "failure"}
        />
      </div>
      <div className="mt-2 mb-2">
        <div className="mb-2">
          <Label htmlFor="price" value="Preço R$" className={color} />
        </div>
        <TextInput
          id="price"
          name="price"
          required
          type="number"
          min={1}
          step={1}
          defaultValue={1}
          color={props.type == OrderType.BUY ? "info" : "failure"}
        />
      </div>
      <Button
        type="submit"
        color={props.type == OrderType.BUY ? "blue" : "failure"}
      >
        Confirmar {translatedType}
      </Button>
    </form>
  );
}
