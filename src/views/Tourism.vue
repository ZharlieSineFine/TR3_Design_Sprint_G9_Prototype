<template>
  <v-container>
    <!-- 搜索和筛选 -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Search Attractions"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedCategory"
          :items="categories"
          label="Attraction Type"
          clearable
          hide-details
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          density="comfortable"
        >
          <v-btn value="grid" prepend-icon="mdi-view-grid">
            Grid View
          </v-btn>
          <v-btn value="map" prepend-icon="mdi-map">
            Map View
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- 网格视图 -->
    <template v-if="viewMode === 'grid'">
      <v-row>
        <v-col
          v-for="spot in filteredSpots"
          :key="spot.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="spot-card"
            @click="showSpotDetail(spot)"
          >
            <v-img
              :src="spot.images[0]"
              height="200"
              cover
              class="spot-image"
            >
              <template v-slot:placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular
                    indeterminate
                    color="grey-lighten-5"
                  />
                </v-row>
              </template>
            </v-img>

            <v-card-title class="text-truncate">
              {{ spot.name }}
            </v-card-title>

            <v-card-subtitle>
              <div class="d-flex align-center">
                <v-rating
                  :model-value="spot.rating"
                  color="amber"
                  density="compact"
                  size="small"
                  readonly
                />
                <span class="ml-2 text-caption">
                  {{ spot.rating.toFixed(1) }}
                </span>
                <v-chip
                  size="x-small"
                  class="ml-2"
                  :color="getCategoryColor(spot.category)"
                >
                  {{ spot.category }}
                </v-chip>
              </div>
            </v-card-subtitle>

            <v-card-text class="text-truncate">
              {{ spot.description }}
            </v-card-text>

            <v-card-actions>
              <v-btn
                variant="text"
                prepend-icon="mdi-map-marker"
                :href="getMapUrl(spot)"
                target="_blank"
              >
                Navigate
              </v-btn>
              <v-spacer />
              <v-btn
                variant="text"
                prepend-icon="mdi-information"
                @click.stop="showSpotDetail(spot)"
              >
                Details
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- 地图视图 -->
    <template v-else>
      <v-card height="600">
        <div id="map" style="height: 100%"></div>
      </v-card>
    </template>

    <!-- 景点详情对话框 -->
    <v-dialog
      v-model="showDialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="selectedSpot">
        <v-carousel
          v-if="selectedSpot.images?.length"
          hide-delimiters
          show-arrows="hover"
          height="400"
        >
          <v-carousel-item
            v-for="(image, i) in selectedSpot.images"
            :key="i"
            :src="image"
            cover
          />
        </v-carousel>

        <v-card-title class="d-flex align-center">
          {{ selectedSpot.name }}
          <v-chip
            size="small"
            class="ml-2"
            :color="getCategoryColor(selectedSpot.category)"
          >
            {{ selectedSpot.category }}
          </v-chip>
        </v-card-title>

        <v-card-subtitle>
          <v-rating
            :model-value="selectedSpot.rating"
            color="amber"
            density="compact"
            readonly
          />
          <div class="mt-2">
            <v-icon size="small" color="primary">mdi-map-marker</v-icon>
            {{ selectedSpot.address }}
          </div>
        </v-card-subtitle>

        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold mb-2">Introduction</div>
          <div class="text-body-1">{{ selectedSpot.description }}</div>

          <v-divider class="my-4" />

          <div class="text-subtitle-1 font-weight-bold mb-2">Opening Hours</div>
          <div class="text-body-1">{{ selectedSpot.openingHours }}</div>

          <v-divider class="my-4" />

          <div class="text-subtitle-1 font-weight-bold mb-2">Ticket Information</div>
          <div class="text-body-1">{{ selectedSpot.ticketInfo }}</div>

          <v-divider class="my-4" />

          <div class="text-subtitle-1 font-weight-bold mb-2">Transportation Guide</div>
          <div class="text-body-1">{{ selectedSpot.transportation }}</div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            :href="getMapUrl(selectedSpot)"
            target="_blank"
            prepend-icon="mdi-map-marker"
          >
            Navigate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useMessage } from '@/utils/message'

const { showError } = useMessage()

// 状态
const spots = ref([])
const searchQuery = ref('')
const selectedCategory = ref(null)
const viewMode = ref('grid')
const showDialog = ref(false)
const selectedSpot = ref(null)
let map = null

// 选项
const categories = [
  { title: 'Natural Scenery', value: 'nature' },
  { title: 'Historical Sites', value: 'history' },
  { title: 'Cultural Venues', value: 'culture' },
  { title: 'Entertainment', value: 'entertainment' }
]

// 计算属性：过滤后的景点列表
const filteredSpots = computed(() => {
  let result = spots.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(spot => 
      spot.name.toLowerCase().includes(query) ||
      spot.description.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    result = result.filter(spot => 
      spot.category === selectedCategory.value
    )
  }

  return result
})

// 获取分类颜色
const getCategoryColor = (category) => {
  const colors = {
    nature: 'success',
    history: 'warning',
    culture: 'info',
    entertainment: 'purple'
  }
  return colors[category] || 'grey'
}

// 获取导航链接
const getMapUrl = (spot) => {
  const query = encodeURIComponent(`${spot.name} ${spot.address}`)
  return `https://maps.google.com/maps?q=${query}`
}

// 显示景点详情
const showSpotDetail = (spot) => {
  selectedSpot.value = spot
  showDialog.value = true
}

// 加载景点数据
const loadSpots = async () => {
  try {
    // 这里应该调用后端API
    spots.value = [
      {
        id: 1,
        name: 'Campus Lake',
        category: 'nature',
        description: 'The largest artificial lake on campus, with beautiful surroundings, perfect for students to relax.',
        address: 'Central Campus Area',
        rating: 4.5,
        images: [
          'https://images.unsplash.com/photo-1496769336828-c522a3a7e33c',
          'https://images.unsplash.com/photo-1496769336828-c522a3a7e33c'
        ],
        openingHours: 'Open 24/7',
        ticketInfo: 'Free',
        transportation: 'Walkable within campus',
        location: { lat: 30.123, lng: 120.456 }
      },
      {
        id: 2,
        name: 'Library',
        category: 'culture',
        description: 'Modern library with rich collections and quiet, comfortable environment.',
        address: 'East Campus',
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1568667256549-094345857637',
          'https://images.unsplash.com/photo-1568667256549-094345857637'
        ],
        openingHours: 'Monday-Sunday 8:00-22:00',
        ticketInfo: 'Free with student ID',
        transportation: 'Accessible by campus shuttle',
        location: { lat: 30.124, lng: 120.457 }
      }
    ]
  } catch (error) {
    showError(error)
  }
}

// 初始化地图
const initMap = () => {
  if (typeof google === 'undefined') return

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 30.123, lng: 120.456 },
    zoom: 15
  })

  // 添加标记
  spots.value.forEach(spot => {
    new google.maps.Marker({
      position: spot.location,
      map,
      title: spot.name
    })
  })
}

// 监听视图模式变化
watch(viewMode, (newMode) => {
  if (newMode === 'map') {
    // 延迟加载地图
    nextTick(() => {
      if (!map) {
        initMap()
      }
    })
  }
})

// 生命周期钩子
onMounted(() => {
  loadSpots()
})

onUnmounted(() => {
  map = null
})
</script>

<style scoped>
.spot-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.spot-image {
  transition: transform 0.3s;
}

.spot-card:hover .spot-image {
  transform: scale(1.05);
}

.v-card-text {
  flex-grow: 1;
}
</style> 