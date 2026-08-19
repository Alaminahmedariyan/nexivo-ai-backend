import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

import { QueryBuilder } from "../../query-builder";

import {
  TIMELINE_SEARCHABLE_FIELDS,
  TIMELINE_FILTERABLE_FIELDS,
  TIMELINE_SORTABLE_FIELDS,
  TIMELINE_SELECT,
  TIMELINE_DEFAULT_SORT,
} from "./timeline.const";

type CreateTimelineEntryInput = {
  title: string;
  description?: string;
  statusDate?: Date;
};

type UpdateTimelineEntryInput = Partial<CreateTimelineEntryInput>;

const createEntry = async (
  projectId: string,
  updatedById: string,
  payload: CreateTimelineEntryInput,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Project not found.",
    );
  }

  const timeline = await prisma.timeline.create({
    data: {
      projectId,
      updatedById,
      ...payload,
    } satisfies Prisma.TimelineUncheckedCreateInput,

    select: {
      ...TIMELINE_SELECT,

      updatedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return timeline;
};

const getByProject = async (
  projectId: string,
  queryParams: Record<string, unknown>,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Project not found.",
    );
  }

  const timelineQuery = new QueryBuilder(
    prisma.timeline,
    {
      searchableFields: [
        ...TIMELINE_SEARCHABLE_FIELDS,
      ],

      filterableFields: {
        ...TIMELINE_FILTERABLE_FIELDS,
      },

      sortableFields: [
        ...TIMELINE_SORTABLE_FIELDS,
      ],

      selectableFields: Object.keys(
        TIMELINE_SELECT,
      ),

      defaultSortField: TIMELINE_DEFAULT_SORT,
    },
  );

  const finalQueryParams: Record<string, unknown> = {
    ...queryParams,
    projectId,
  };

  const result = await timelineQuery.execute(
    finalQueryParams,
  );

  if (result.data.length === 0) {
    return {
      data: [],
      meta: result.meta,
    };
  }

  const timelineIds = result.data.map(
    (item) => item.id,
  );

  const timelines = await prisma.timeline.findMany({
    where: {
      projectId,
      id: {
        in: timelineIds,
      },
    },

    select: {
      ...TIMELINE_SELECT,

      updatedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const timelineMap = new Map(
    timelines.map((timeline) => [
      timeline.id,
      timeline,
    ]),
  );

  const orderedData = timelineIds
    .map((id) => timelineMap.get(id))
    .filter(
      (
        item,
      ): item is (typeof timelines)[number] =>
        Boolean(item),
    );

  return {
    data: orderedData,
    meta: result.meta,
  };
};

const getById = async (projectId: string, timelineId: string) => {
  const timeline = await prisma.timeline.findFirst({
    where: {
      id: timelineId,
      projectId,
    },
    select: {
      ...TIMELINE_SELECT,
      updatedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!timeline) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Timeline entry not found.",
    );
  }

  return timeline;
};

const updateEntry = async (
  projectId: string,
  timelineId: string,
  updatedById: string,
  payload: UpdateTimelineEntryInput,
) => {
  const isExist = await prisma.timeline.findFirst({
    where: {
      id: timelineId,
      projectId,
    },
  });

  if (!isExist) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Timeline entry not found.",
    );
  }

  const updatedEntry = await prisma.timeline.update({
    where: { id: timelineId },
    data: {
      ...payload,
      updatedById,
    },
    select: {
      ...TIMELINE_SELECT,
      updatedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedEntry;
};

const deleteEntry = async (projectId: string, timelineId: string) => {
  const isExist = await prisma.timeline.findFirst({
    where: {
      id: timelineId,
      projectId,
    },
  });

  if (!isExist) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Timeline entry not found.",
    );
  }

  await prisma.timeline.delete({
    where: { id: timelineId },
  });

  return null;
};

export const timelineService = {
  createEntry,
  getByProject,
  getById,
  updateEntry,
  deleteEntry,
};