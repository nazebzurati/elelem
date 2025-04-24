import db from "@database/config";
import { ProviderWithCount } from "@database/provider";
import {
  IconCodeAsterix,
  IconInfoCircle,
  IconMessages,
  IconPlus,
  IconRefresh,
  IconServer,
} from "@tabler/icons-react";
import { fetchModelList } from "@utils/conversation";
import { toggleModal, UiToggleState } from "@utils/toggle";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AddProviderModalId } from "./add.modal";
import useAlert, { AlertTypeEnum } from "@stores/alert";

export default function Navbar({
  providerList,
}: {
  providerList?: ProviderWithCount[];
}) {
  const [isRefresh, setIsRefresh] = useState(false);

  const alertStore = useAlert();

  const onRefreshModel = async () => {
    if (!providerList || isRefresh) return;
    setIsRefresh(true);

    for (const provider of providerList) {
      // get existing and new model list
      const modelList = await fetchModelList(provider.baseURL, provider.apiKey);
      const existingModelList = (
        await db.model.where({ providerId: provider.id }).toArray()
      ).map((model) => model.id);

      // delete missing model
      const modelIdListToDelete = existingModelList.filter(
        (modelId) => !modelList.includes(modelId),
      );
      for (const modelId of modelIdListToDelete) {
        await db.model.delete(modelId);
      }

      // add new model
      const modelIdListToAdd = modelList.filter(
        (modelId) => !existingModelList.includes(modelId),
      );
      for (const modelId of modelIdListToAdd) {
        await db.model.add({ id: modelId, providerId: provider.id });
      }
    }

    alertStore.add({
      type: AlertTypeEnum.SUCCESS,
      message: "Model list refreshed!",
    });
    setIsRefresh(false);
  };

  return (
    <>
      {/* navbar */}
      <div className="navbar bg-base-200">
        <div className="navbar-start">
          <div className="font-bold ms-4 sm:hidden">Providers</div>
        </div>
        <div className="navbar-center">
          <ul className="p-0 not-sm:hidden menu menu-horizontal">
            <li>
              <Link to="/conversation">
                <IconMessages className="h-6 w-6" />
                Chats
              </Link>
            </li>
            <li>
              <Link to="/prompt">
                <IconCodeAsterix className="h-6 w-6" />
                Prompts
              </Link>
            </li>
            <li>
              <Link to="/provider" className="text-primary">
                <IconServer className="h-6 w-6" />
                Providers
              </Link>
            </li>
            <li>
              <Link to="/about">
                <IconInfoCircle className="h-6 w-6" />
                About
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={onRefreshModel}
          >
            <IconRefresh className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => {
              toggleModal(AddProviderModalId, UiToggleState.OPEN);
            }}
          >
            <IconPlus className="h-6 w-6" />
          </button>
        </div>
      </div>
      {/* dock */}
      <div className="sm:hidden dock border-t-0 bg-base-200">
        <Link to="/conversation">
          <IconMessages className="h-6 w-6" />
          <span className="dock-label">Chats</span>
        </Link>
        <Link to="/prompt">
          <IconCodeAsterix className="h-6 w-6" />
          <span className="dock-label">Prompts</span>
        </Link>
        <Link to="/provider" className="text-primary">
          <IconServer className="h-6 w-6" />
          <span className="dock-label">Providers</span>
        </Link>
        <Link to="/about">
          <IconInfoCircle className="h-6 w-6" />
          <span className="dock-label">About</span>
        </Link>
      </div>
    </>
  );
}
